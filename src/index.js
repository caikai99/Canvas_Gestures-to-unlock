(function () {
    /** @type {HTMLCanvasElement}*/
    window.CanvasLock = function (obj) {
        this.height = obj.height;
        this.width = obj.width,
            this.chooseType = obj.chooseType
    };
    //动态创建 在原型上创建一个函数
    CanvasLock.prototype.iniDom = function () {
        //创建div
        var wrap = document.createElement('div');
        //创建h4标签
        var str = '<h4 id="title" class="title">绘制解锁图案</h4>';
        //div css属性
        wrap.setAttribute('style', 'position:absolute;top:0;left:0;right:0;bottom:0;');
        //创建canvas
        var canvas = document.createElement('canvas');
        canvas.setAttribute('id', 'canvas');
        canvas.style.cssText = 'background-color:#305066;display:inline-block;'
        wrap.innerHTML = str;
        wrap.appendChild(canvas);
        var width = this.width || 300;
        var height = this.height || 300;
        document.body.appendChild(wrap);
        //高清屏锁
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        canvas.width = width;
        canvas.height = height;
    }
    //初始化密码面板  绘制圆
    CanvasLock.prototype.drawCle = function (x, y) {
        this.ctx.strokeStyle = 'white';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(x, y, this.r, 0, Math.PI * 2, true);
        this.ctx.closePath();
        this.ctx.stroke();
    }
    //创建坐标根据canvas的大小评分半径
    CanvasLock.prototype.createCircle = function () {
        var n = this.chooseType; //根据前面传过来的数 一行几个圆
        var count = 0;
        this.r = this.ctx.canvas.width / (2 + 4 * n);//公式计算 每个圆均分 有4给半径 最外层有2个
        this.arr = [];
        this.restPoint = [];
        this.lastPoint = [];
        this.touchFlag = false;
        var r = this.r;
        for (var i = 0; i < n; i++) {//行
            for (var j = 0; j < n; j++) {//列
                count++;
                var obj = {
                    x: j * 4 * r + 3 * r, //获取每个圆的x
                    y: i * 4 * r + 3 * r,//每个圆的y
                    index: count
                }
                console.log(obj.index);
                // console.log(r);21.多
                this.arr.push(obj);
                this.restPoint.push(obj);

            }
        }
        //清空之前的
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        for (var i = 0; i < this.arr.length; i++) { //绘制圆
            this.drawCle(this.arr[i].x, this.arr[i].y)
        }
    }
    //初始化  执行里面的函数
    CanvasLock.prototype.init = function () {
        this.iniDom();
        //绘制canvas
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.createCircle();//执行函数
        this.bindEvent();
    }
    CanvasLock.prototype.bindEvent = function () {
        var self = this;
        //鼠标按住执行的操作
        this.canvas.addEventListener("touchstart", function (e) {
            var po = self.getPosition(e);//x和y
            console.log(po.x);
            for (var i = 0; i < self.arr.length; i++) {
                //取绝对值判断 po的xy减去里面的xy之后是不是小于半径
                if  (Math.abs(po.x - self.arr[i].x) < self.r && Math.abs(po.y - self.arr[i].y) < self.r) {
                self.touchFlag = true;
                self.lastPoint.push(self.arr[i]);
                self.restPoint.splice(i, 1);//删除我按住当前i的数组
                break;
                }
            }
        }, false);
        //鼠标移动的回调函数
        this.canvas.addEventListener("touchmove", function (e) {
            if (self.touchFlag) {
                self.update(self.getPosition(e));
            }
        }, false);
        this.canvas.addEventListener("touchend", function (e) {
            if (self.touchFlag) {
                self.storePass(self.lastPoint);
               setTimeout(function () {
                   self.rech();
                 },300)
            }
        }, false);
    }

    CanvasLock.prototype.getPosition = function (e) {// 获取touch点相对于canvas的坐标
        var rect = e.currentTarget.getBoundingClientRect();
        var po = {
            x: (e.touches[0].clientX - rect.left),
            y: (e.touches[0].clientY - rect.top)
        };
        return po;
    }
    //获取 我鼠标位于canvas 上面的位置
    // CanvasLock.prototype.getPosition = function (e) {
    //     var rect = e.currentTarget.getBoundingClientRect(); //canva 距离顶部的文档的位置
    //     var po = {
    //         x: (e.touches[0].clientX - rect.left),//touches[0]相当于当手操作
    //         y: (e.touches[0].clientY - rect.top)
    //     };
    //     return po;
    //     console.log(po.x);
    // }


    //鼠标按住执行的回调函数
    CanvasLock.prototype.update = function (po) {
        //清空之前画的 不清空的话 画的线会都显示出来
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        //重新换9给圆  不重新绘画 当我们鼠标按上去的时候 圆就会消失
        for (var i = 0; i < this.arr.length; i++) {
            this.drawCle(this.arr[i].x, this.arr[i].y);
        }
        this.drawPoint();// 画圆
        this.drawLine(po);// 画线
        // 1、检测手势移动的位置是否处于下一个圆内
        // 2、圆内的话则画圆 drawPoint
        // 3、已经画过实心圆的圆，无需重复检测
        //判断 当我po的x和y小于设置半径的x和y的时候 那就证明我在圆里面
        for (var i = 0; i < this.restPoint.length; i++) {
            if (Math.abs(po.x - this.restPoint[i].x) < this.r && Math.abs(po.y - this.restPoint[i].y) < this.r) {
                this.drawPoint();
                this.lastPoint.push(this.restPoint[i]);
                this.restPoint.splice(i, 1);
                break;
            }
        }
    }
    //将圆画出来
    CanvasLock.prototype.drawPoint = function () { // 初始化圆心 
        /*将鼠标按住的圆的xy传进来
            设置背景颜色 
            清除之前的线
            绘制圆 圆必须是之前圆半径的一般
            闭合并且填充
        */
        for (var i = 0; i < this.lastPoint.length; i++) {
            this.ctx.fillStyle = '#CFE6FF';
            this.ctx.beginPath();
            this.ctx.arc(this.lastPoint[i].x, this.lastPoint[i].y, this.r / 2, 0, Math.PI * 2, true);
            this.ctx.closePath();
            this.ctx.fill();
        }

    }
    //画线
    CanvasLock.prototype.drawLine = function (po) {// 解锁轨迹
        this.ctx.beginPath();
        this.ctx.lineWidth = 3;
        //起始点在我当前的圆心的位置
        this.ctx.moveTo(this.lastPoint[0].x, this.lastPoint[0].y);
        //循环我每次的线  保存起来 不循环的话 只有一条线 就是起始线
        for (var i = 1; i < this.lastPoint.length; i++) {
            this.ctx.lineTo(this.lastPoint[i].x, this.lastPoint[i].y);
        }
        this.ctx.lineTo(po.x, po.y)
        this.ctx.stroke();
    }
    /*检测路径是否正确
    如果正确重置变绿色 不对变红
    重置
    */
    CanvasLock.prototype.storePass = function () {
        if (this.checkPass()) {
            document.getElementById('title').innerHTML = '解锁成功';
            document.getElementById('title').style.color = 'green';
            this.drawStatusPoint('green');
        } else {
            document.getElementById('title').innerHTML = '解锁失败';
            document.getElementById('title').style.color = 'red';
            this.drawStatusPoint('red');
        }
    }
    //验证密码正确或者错误
    CanvasLock.prototype.checkPass = function(){
        var p1 = '234';
        var p2 = '';
        for(var i = 0 ;i < this.lastPoint.length;i++){
            p2+=this.lastPoint[i].index;
        }
       return p1 === p2;
    };
    CanvasLock.prototype.drawStatusPoint = function (type) {
        for(var i = 0 ;i<this.lastPoint.length;i++){
            this.ctx.strokeStyle=type;
           this.ctx.beginPath();
            this.ctx.arc(this.lastPoint[i].x,this.lastPoint[i].y,this.r,0,Math.PI*2,true);
            this.ctx.stroke();
        }
      }
      //重置
      CanvasLock.prototype.rech= function () {
          this.createCircle();
        }
})();
