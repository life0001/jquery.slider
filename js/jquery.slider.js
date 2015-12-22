;(function($,window,document,undefined){
    //为什么要传入$
    //  通过定义一个匿名函数，创建了一个“私有”的命名空间，该命名空间的变量和方法，不会破坏全局的命名空间。这点非常有用也是一个 JS 框架必须支持的功能，jQuery 被应用在成千上万的 JavaScript 程序中，必须确保 jQuery 创建的变量不能和导入他的程序所使用的变量发生冲突。
    //为什么要传入window 和 document
    //通过传入 window 和 document 变量，使得 window 由全局变量变为局部变量，当在 jQuery 代码块中访问 window 和 document 时，不需要将作用域链回退到顶层作用域，这样可以更快的访问 window 和 document；这还不是关键所在，更重要的是，将 window 和 document作为参数传入，可以在压缩代码时进行优化
    //为什么要传入undefined
    //在自调用匿名函数的作用域内，确保 undefined 是真的未定义。因为 undefined 能够被重写，赋予新的值
    var Slider=function(element,options){  //过程
        var _ = this,
            _timer,                   //动画函数
            _index=0;                 //当前帧
        var $this=$(element),
            $list=$this.find(options.movingBody),          //轮播内容父元素 u1
            $listLi=$list.find('li'),                       //轮播内容父元素里的u1 li
            $navList=$this.find(options.navList),          //轮播内小的导航列表父级  u2
            $arrow=$this.find(options.arrow),              //所有箭头               arrow
            $prevBtn=$this.find(options.prevBtn),          //上一张按钮             prev
            $nextBtn=$this.find(options.nextBtn),          //下一张按钮             next
            $u2Li;

        //初始化
        (function init(){
            $this.width(options.imgWidth).height(options.imgHeight).css('margin-left',-options.imgWidth/2); //设置主容器的宽高和位置
            $listLi.each(function(){
                $navList.append('<li></li>');
            }).find('a').width(options.imgWidth).height(options.imgHeight);
            $u2Li=$navList.find('li');
            $u2Li.first().addClass(options.activeTriggerCls);
            $u2Li.last().css('margin-right',0)
        })();

        //纵向滚动
        if(options.Direction!='x'){
            if(options.sliderDirection=='down_up'){
                $list.css({top:0,width:(options.imgWidth)});
            }
        }

        //上一帧
        this.prev=function(e){
            _index--;
            move();
        };

        //下一帧
        this.next=function(e){
            _index++;
            move();
        };

        //自动轮播
        if(options.auto==true) _timer=setInterval(_.next,options.delay);

        //停止
        this.stop=function(){
            if(options.immediately==true){
                clearInterval(_timer);
            }
        };

        //继续滚动
        this.start=function(){
            if(options.auto==true && options.immediately==true) _timer=setInterval(_.next,options.delay);
        };

        //鼠标移到主容器上的动作
        switch(options.arrowEvent){
            case 'awaysShow':
                $arrow.show();
                $this.on({
                    'mouseenter':function(){
                        _.stop();
                    },'mouseleave':function(){
                        _.start();
                    }
                });
                break;
            case 'awaysHide':
                $arrow.hide();
                $this.on({
                    'mouseenter':function(){
                        _.stop();
                    },'mouseleave':function(){
                        _.start();
                    }
                });
                break;
            default:
                $this.on({
                    'mouseenter':function(){
                        _.stop();
                        $arrow.show();
                    },'mouseleave':function(){
                        $arrow.hide();
                        _.start();
                    }
                });
        }

        //点击箭头事件
        if(options.arrowEventType=='click'){
            $prevBtn.on('click',_.prev);
            $nextBtn.on('click',_.next);
        }

        //是否有导航触发点
        options.navTriggers==true && $navList.show();

        //轮播导航事件类型
        if(options.sliderNavEvent=='click'){
            $u2Li.click(function(){
                if(_index==$(this).index()) return;
                _index=$(this).index();
                move();
                _.stop();
            });
        }else{
            $u2Li.hover(function(){
                if(_index==$(this).index()) return;
                _index=$(this).index();
                move();
                _.stop();
            },function(){});
        }

        //fadeIn和hide show切换
        this.Move_shareFlash=function(){
            $list.width(options.imgWidth);
            if(_index>$listLi.length-1) _index=0;
            if(_index<0) _index=$listLi.length-1;
            $u2Li.removeClass(options.activeTriggerCls).eq(_index).addClass(options.activeTriggerCls);
        };

        //滚动动作
        this.Move_shareRoll=function(){
            var property={
                odirection1:options.Direction=='x' ? {left:-options.imgWidth * _index}:{top:-options.imgHeight * _index},
                odirection2:options.Direction=='x' ? {left:-options.imgWidth}:{top:-options.imgHeight},
                odirection3:options.Direction=='x' ? {left:-options.imgWidth * ($listLi.length-1)}:{top:-options.imgHeight * ($listLi.length-1)},
                to0:options.Direction=='x' ? {left:0}:{top:0}
            };
            if(_index>$listLi.length-1){
                $listLi.first().clone().appendTo($list);
                var $lastli=$list.find('li').last();
                $list.animate(property.odirection1,options.duration,function(){
                    $lastli.remove();
                    $list.css(property.to0);
                    _index=0;
                });
                $u2Li.removeClass(options.activeTriggerCls).first().addClass(options.activeTriggerCls);
            }else{
                if(_index<0){
                    $listLi.last().clone().prependTo($list);
                    var $firstli=$list.find('li').first();
                    $list.css(property.odirection2).animate(property.to0,options.duration,function(){
                        $firstli.remove();
                        $list.css(property.odirection3);
                        _index=$listLi.length-1;
                    });
                    $u2Li.removeClass(options.activeTriggerCls).last().addClass(options.activeTriggerCls);

                }else{
                    $list.animate(property.odirection1,options.duration);
                    $u2Li.removeClass(options.activeTriggerCls).eq(_index).addClass(options.activeTriggerCls);
                }
            }
        };
        function move(isAnimate,animateType){
            $list.stop(true,true);
            if(options.Direction=='x'){
                //横向
                switch(options.animate){
                    case 'xRoll':
                        _.Move_shareRoll();
                        break;
                    case 'fadeIn':
                        _.Move_shareFlash();
                        $listLi.hide().eq(_index).fadeIn(options.duration);
                        break;
                    default :
                        _.Move_shareFlash();
                        $listLi.hide().eq(_index).show();
                }
            }else{
                //纵向
                _.Move_shareRoll();
            }
        }
    };

    $.fn.slider=function(parameter,callback){
        //$.fn.slider() //是给jQuery增加了一个slider方法
        if(typeof parameter == 'function'){ //重载
            callback = parameter;
            parameter = {};
        }else{
            parameter = parameter || {};
            callback = callback || function(){};
        }

        var defaults={
            movingBody:'.u1',             //轮播内容父元素
            navList:'.u2',               //轮播内小的导航列表
            arrow:'.arrow',                 //所有箭头按钮
            prevBtn:'.prev',                 //上一张按钮
            nextBtn:'.next',                 //下一张按钮
            activeTriggerCls: 'color',   //导航选中时的class
            /* 动画相关 */
            Direction:'y',              //移动方向 'x'横向，否则纵向
            sliderDirection:'down_up',  //移动方向 纵向 默认'down_up'由下而上滚动   *****Direction必须是纵向
            navTriggers:true,           //是否有导航触发点
            arrowEvent:'',   // 'awaysShow'表示无论鼠标是否移入，箭头始终显示，'awaysHide'始终隐藏，默认鼠标移入显示
            arrowEventType:'click',    //箭头事件类型'click'表示鼠标点击时触发
            sliderNavEvent:'',         //轮播导航 ‘click’鼠标点击触发，默认鼠标移入时触发
            auto:true,                   //是否自动播放
            immediately: true,         //悬浮是否立即停止
            animate: 'xRoll',              //轮播类型：'xRoll'左右滚动  'fadeIn'淡入淡出  默认左右切换   *****Direction必须是横向
            imgWidth: 1920,              //设置容器宽度
            imgHeight: 500,              //设置容器高度
            delay: 5000,                 //自动播放时停顿的时间间隔
            duration: 500              //轮播的动画时长
        };
        var options= $.extend({},defaults,parameter); //把参数parameter的值 和 slider方法里面的defaults对象内的值 合并后 赋给options
        var Newslider=new Slider(this,options);
        callback(Newslider)
    }; //传参或默认值
})(jQuery,window,document);