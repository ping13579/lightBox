;(function(){
    var LightBox = function(settings){
        var self = this;
        this.settings ={
            speed:500
        };
        $.extend(this.settings,settings||{})
        //创建遮罩和弹出框
        this.popupMask = $('<div id="G-lightbox-mask">');
        this.popupWin = $('<div id="G-lightbox-popup">');

        //保存body
        this.bodyNode = $(document.body);

        this.renderDom();

        this.picViewArea =this.popupWin.find('.lightbox-pic-view');
        this.popupPic = this.popupWin.find('.lightbox-image');
        this.picCaptionArea = this.popupWin.find('.lightbox-pic-caption');

        this.nextBtn = this.popupWin.find('.lightbox-next-btn');
        this.prevBtn = this.popupWin.find('.lightbox-prev-btn');
        this.captionText = this.popupWin.find('.lightbox-pic-desc');
        this.currentIndex = this.popupWin.find('.lightbox-of-index');
        this.closeBtn = this.popupWin.find('.lightbox-close-btn');

        this.groupName = null;
        this.groupData = [];//放置同一组数据
        this.bodyNode.delegate('.js-lightbox,*[data-role=lightbox]','click',function(e){
            e.stopPropagation();

            var currentGroupName = $(this).attr('data-group');
            if(currentGroupName !=self.groupName){
                self.groupName = currentGroupName;
                //根据当前组名获取同一组数据
                self.getGroup();
            }
            //初始化弹出框
            self.initPopup($(this));
        });
        //关闭弹窗
        this.popupMask.click(function(){
            $(this).fadeOut();
            self.popupWin.fadeOut();
            self.clear = false;
        });
        this.closeBtn.click(function(){
            self.popupMask.fadeOut();
            self.popupWin.fadeOut();
            self.clear = false;
        });
        this.flag = true;
        this.nextBtn.hover(function() {
            if(!$(this).hasClass('disabled') && self.groupData.length>1){
                $(this).addClass('lightbox-next-btn-show')
            }
        }, function() {
            if(!$(this).hasClass('disabled') && self.groupData.length>1){
                $(this).removeClass('lightbox-next-btn-show')
            }
        }).click(function(e) {
            if(!$(this).hasClass('disabled') && self.flag){
                self.flag = false;
                e.stopPropagation();
                self.goTo('next');
            }
        });
        this.prevBtn.hover(function() {
            if(!$(this).hasClass('disabled') && self.groupData.length>1){
                $(this).addClass('lightbox-prev-btn-show')
            }
        }, function() {
            if(!$(this).hasClass('disabled') && self.groupData.length>1){
                $(this).removeClass('lightbox-prev-btn-show')
            }
        }).click(function(e){
            if(!$(this).hasClass('disabled') && self.flag){
                self.flag = false;
                e.stopPropagation();
                self.goTo('prev');
            }
        });
        //窗口调整
        var timer =null;
        this.clear = false;
        $(window).resize(function(){
            if(self.clear){
                window.clearTimeout(timer);
                timer = window.setTimeout(function(){
                    self.loadPicSize(self.groupData[self.index].src);
                },500)
            }
        }).keyup(function(e){
            var keyValue = e.which;
            if(self.clear){
                switch (keyValue){
                    case 37:
                        self.prevBtn.click();
                        break;
                    case 39:
                        self.nextBtn.click();
                        break;
                }
            }
        })
    };
    LightBox.prototype={
        goTo: function (dir) {
            if(dir==='next'){
                //this.groupData
                this.index++;
                if(this.index>=this.groupData.length-1){
                    this.nextBtn.addClass('disabled').removeClass('lightbox-next-btn-show');
                };
                if(this.index!==0){
                    this.prevBtn.removeClass('disabled');
                };
                var Src =this.groupData[this.index].src;
                this.loadPicSize(Src);
            }else if(dir==='prev'){
                this.index--;
                if(this.index<=0){
                    this.prevBtn.addClass('disabled').removeClass('lightbox-prev-btn-show');
                };
                if(this.index!==this.groupData.length-1){
                    this.nextBtn.removeClass('disabled');
                };
                var Src =this.groupData[this.index].src;
                this.loadPicSize(Src);
            }
        },
        showMaskAndPopup:function(sourceSrc,currentId){
            var self = this;
            this.popupPic.hide();
            this.picCaptionArea.hide();
            this.popupMask.fadeIn();
            var winWidth = $(window).width(),
                winHeight = $(window).height();

            this.picViewArea.css({
                width:winWidth/2,
                height:winHeight/2
            });

            this.popupWin.fadeIn();

            var viewHeight = winHeight/2+10;
            this.popupWin.css({
                width:winWidth/2+10,
                height:viewHeight,
                marginLeft:-(winWidth/2+10)/2,
                top:-viewHeight
            }).animate({
                top:(winHeight-viewHeight)/2
                },self.settings.speed,function(){
                    //加载图片
                    self.loadPicSize(sourceSrc);
            });
            //根据当前Id 获取索引
            this.index = this.getIndexOf(currentId);

            var groupDatalength = this.groupData.length;
            if(groupDatalength>1){
                //this.nextBtn
                if(this.index===0){
                    this.prevBtn.addClass('disabled');
                    this.nextBtn.removeClass('disabled');
                }else if(this.index===groupDatalength-1){
                    this.nextBtn.addClass('disabled');
                    this.prevBtn.removeClass('disabled');
                }else{
                    this.nextBtn.removeClass('disabled');
                    this.prevBtn.removeClass('disabled');
                }
            }
        },
        loadPicSize:function(sourceSrc){
            var self=this;

            self.popupPic.css({
                width:'auto',
                height:'auto'
            }).hide();
            self.picCaptionArea.hide();
            this.preLoadImg(sourceSrc,function(){

                self.popupPic.attr('src',sourceSrc);
                var picWidth = self.popupPic.width(),
                    picHeight = self.popupPic.height();
                self.changePic(picWidth,picHeight);
            })
        },
        changePic:function(width,height){

            var self = this,
                winWidth = $(window).width(),
                winHeight = $(window).height();

            //如果图片的宽高大于浏览器视口，

            var Scale = Math.min(winWidth/(width+10),winHeight/(height+10),1);

            width = width*Scale;
            height = height*Scale;

            this.picViewArea.animate({
                width:width-10,
                height:height-10
            },self.settings.speed);
            this.popupWin.animate({
                width:width,
                height:height,
                marginLeft:-(width/2),
                top:(winHeight-height)/2
            },self.settings.speed,function () {
                self.popupPic.css({
                    width:width-10,
                    height:height-10
                }).fadeIn();
                self.picCaptionArea.fadeIn();
                self.flag = true;
                self.clear = true;
            });

            //设置描述文字和当前索引
            this.captionText.text(this.groupData[this.index].caption);
            this.currentIndex.text('当前索引： '+(this.index+1)+' of '+this.groupData.length)

        },
        preLoadImg: function (src,callback) {
            var img = new Image();
            if(!!window.ActiveXObject){
                img.onreadystatechange=function(){
                    if(this.readyState=='complete'){
                        callback();
                    }
                };
            }else{
                img.onload=function(){
                    callback();
                };
            }
            img.src = src;
        },
        getIndexOf: function (currentId) {
            var index = 0;
            $(this.groupData).each(function(i){
                index=i;
                if(this.id == currentId){
                   return false;
                }
            });
            return index ;
        },
        initPopup:function(currentObj){
            var self = this,
                sourceSrc=currentObj.attr('data-source'),
                currentId =currentObj.attr('data-id');
            this.showMaskAndPopup(sourceSrc,currentId);

        },
        getGroup:function(){
            var self = this;
            //根据当前的组别名称获取所有相同组别的对象
            var groupList = this.bodyNode.find('*[data-group='+this.groupName+']');
            //清空数组
            self.groupData.length = 0;
            groupList.each(function(){
                self.groupData.push({
                    src:$(this).attr('data-source'),
                    id:$(this).attr('data-id'),
                    caption:$(this).attr('data-caption')
                })
            });
        },
        renderDom:function(){
            var strDOM = '<div class="lightbox-pic-view">'+
                '<span class="lightbox-btn lightbox-prev-btn"></span>'+
                '<img class="lightbox-image" src="./img/xbjz1.png">'+
                '<span class="lightbox-btn lightbox-next-btn"></span>'+
                '</div>'+
                '<div class="lightbox-pic-caption">'+
                '<div class="lightbox-caption-area">'+
                '<p class="lightbox-pic-desc"></p>'+
                '<span class="lightbox-of-index">当前索引：</span>'+
                '</div>'+
                '<span class="lightbox-close-btn"></span>'+
                '</div>'
            this.popupWin.html(strDOM);
            this.bodyNode.append(this.popupMask,this.popupWin)
        }
    };
    window['LightBox'] = LightBox;
})();