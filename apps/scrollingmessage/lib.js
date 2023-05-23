// GB({t:"notify",id:1680248072,src:"SMS Messenger",title:"Fabia",body:"Nein"})
// msg = {"t":"add","id":1680248072,"src":"SMS Messenger","title":"Fabia","body":"Nein","new":true,"handled":true}
var xxl = {
// private:
    msg: [],
    drawTimeout: undefined,
    xpos : 0,
    loopCount : 0,
    txt:'',
    txtBody:'',
    renderStr: '',
    numPages: 0,
    txtFrom:'',
    wtot:0,
    img:undefined,
    imgcol:'#ffffff',
    msgs:[],
    activeMessage:0,
    // gfx buffer
    bufimg:undefined,
    bufpal4color:undefined,
    buffnt:'6x15', // font to use. Built-in: 4x6, 6x8,12x20,6x15,Vector
    bufw:0, // width of buffer for all lines
    bufh:0, // height of buffer
    buflin:0, // number of lines to print
    bufscale:0, // scale factor for buffer to screen

// public:
    show: function(theMessage){
        // console.log("theMessage is:");
        // console.log(theMessage);
        xxl.msg = theMessage;

        // get icon
        try{
            xxl.img = require("messageicons").getImage(xxl.msg);
            xxl.imgcol = (require("messageicons").getColor(xxl.msg, '#ffffff')||'#00ffff');
        }catch(e){}

        Bangle.loadWidgets();

        Bangle.on('touch', function (b, xy) {
            xxl.stop();
        });
        setWatch(xxl.stop, BTN1);
        Bangle.buzz(500,1);


        // offscreen gfx buffer
        // screen is 176x176
        // font should be scaled 5x9=30x72px
        // built in fonts are 4x6, 6x8,12x20,6x15,Vector
        xxl.bufpal4color = new Uint16Array([0x0000,0xFFFF,0x7BEF,0xAFE5],0,2);   // b,w,grey,greenyellow
        g.setFont(xxl.buffnt);
        var hfont = g.getFontHeight();
        xxl.bufscale=parseInt((g.getHeight() - 24/*widgets*/)/2) / hfont;
        xxl.buflin=2; // number of lines
        xxl.bufw=(g.getWidth() * xxl.buflin) / xxl.bufscale; // 6x15 font scaled by 5 on 176 screen width
        xxl.bufh=hfont;

        xxl.bufimg = Graphics.createArrayBuffer(xxl.bufw,xxl.bufh,2,{msb:true});

        // prepare string and metrics
        xxl.txt = (xxl.msg.title||(xxl.msg.src||"MSG")) + ": " + (xxl.msg.body||"-x-");
        xxl.txtFrom = xxl.msg.title;

        if(!xxl.txtFrom) {
            xxl.txtFrom = xxl.msg.src;
        }

        xxl.txtBody = xxl.msg.body;
        g.setFont(xxl.buffnt);
        xxl.wtot = g.stringMetrics(xxl.txt).width;
        xxl.xpos = xxl.bufw; // g.getWidth();
        xxl.msgs.push(this.getTextMessage());
        //xxl.renderStr = this.getTextMessage();

        xxl.draw();
    },

//private:

    queueDraw: function() {
        if (xxl.drawTimeout) clearTimeout(xxl.drawTimeout);

        if (xxl.drawTimeout) { return; } // clearTimeout(xxl.drawTimeout); }
            xxl.drawTimeout = setTimeout(function () {
            xxl.drawTimeout = undefined;
            xxl.draw();
        },3000);
    },


    stop:function() {
        // console.log("stop");
        if (xxl.drawTimeout) { clearTimeout(xxl.drawTimeout); }
        xxl.drawTimeout = undefined;
        g.reset();
        g.setBgColor('#ffff00');
        g.clear();
        xxl.msgs = [];
        xxl.activeMessage = 0;
        // Bangle.setLCDPower(0); // light off
        // Bangle.setLocked(true); // disable touch

        setTimeout(function(){Bangle.showClock();}, 100);
    },

    getNextBreakPos: function(st) {
        let testStr = "";
        let breakPos = -1;
        
        for(let i=0; i< st.length; i++) {
          testStr += st[i];
          console.log("testStr", testStr);
          if(g.stringWidth(testStr)>=180) {
            return i-1;
          }
        }
        return breakPos;
    },    
    getTextMessage: function() {
        return xxl.txtFrom + ' - ' + xxl.txtBody;
    },
    draw: function() {
        try {
            
        g.reset();
        Bangle.setLCDPower(1); // light on
        Bangle.setLocked(false); // keep the touch input active
        g.setBgColor('#FFFFFF');        
        g.clear();
        let ypos = 20;
        g.setFont("Vector:25");
        if(xxl.renderStr=="") {
            xxl.numPages = 0;
            if(xxl.activeMessage<xxl.msgs.length-1) {
                xxl.activeMessage++;
            }
            xxl.renderStr = xxl.msgs[xxl.activeMessage];
        }
        xxl.numPages++;
        
        while(xxl.renderStr.length>0) {
          let drawStr = "";
          let breakPos = xxl.getNextBreakPos(xxl.renderStr);
          console.log('breakPos', breakPos);
          if(breakPos == -1) {
            drawStr = xxl.renderStr;
            xxl.renderStr = "";
          } else {
            drawStr = xxl.renderStr.substring(0,breakPos);
            xxl.renderStr = xxl.renderStr.slice(breakPos);
          }
          g.drawString(drawStr, 0,ypos);
          if(ypos>=150) {
            break;
          }
          ypos+=15;
        }

        xxl.queueDraw();
    } catch (error) {
        g.drawString(error, 0,10);
    }

    },
    drawOld: function() {
        var wh = 24; // widgets height
        var gw = g.getWidth();
        var h = (g.getHeight() - wh)/2; // height of drawing area per stripe

        Bangle.setLCDPower(1); // light on
        Bangle.setLocked(false); // keep the touch input active
        g.setBgColor('#000000');
        g.clear();

        // center line
        g.setColor(xxl.imgcol);
        g.fillRect(      0,wh+h-3,gw/2-26,wh+h-1);
        g.fillRect(gw/2+26,wh+h-3,   gw-1,wh+h-1);

        // image
        /*
        if (xxl.img) { // 24x24
            g.setColor(xxl.imgcol);
            g.drawImage(xxl.img
                        , gw/2, wh+h-2 // center point
                        ,{rotate:0,scale:2}
                       );
        }
        */
        // scroll message
        xxl.megaPrint(xxl.txtBody, xxl.xpos, wh);
                                            
        g.reset();
        // widget redraw
        Bangle.drawWidgets();

        // scroll
        xxl.xpos -= 3; // buffer pixels
        if (xxl.xpos < -xxl.wtot - xxl.bufw/xxl.buflin - 4) {
            ++xxl.loopCount;
            if (xxl.loopCount > 2) {
                xxl.stop();
                return;
            }
            xxl.xpos = (3*xxl.bufw)/2;
        }
        // loop drawing
        xxl.queueDraw();
    }
};


// for IDE
// var exports={};

exports.listener = function (type, msg) {
    // msg = {t:"add",id:int, src,title,subject,body,sender,tel, important:bool, new:bool}
    if (!msg) return;
    if (type === 'text' && msg.t !== 'remove') {
        msg.handled = true; // don't do anything else with the message
        xxl.show(msg);
    }
};

// debug
// var msg = {t:"add",id:12341, src:"SMS",title:undefined,subject:undefined,body:"yes",sender:"phoo",tel:undefined, important:false, new:true};
// exports.listener('text', msg);







