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
    msgs:[],
    activeMessage:0,

// public:
    show: function(theMessage){
        xxl.msg = theMessage;

        Bangle.on('touch', function (b, xy) {
            xxl.stop();
        });

        setWatch(xxl.stop, BTN1);

        Bangle.buzz(500,1);

        // prepare string and metrics
        xxl.txt = (xxl.msg.title||(xxl.msg.src||"MSG")) + ": " + (xxl.msg.body||"-x-");
        xxl.txtFrom = xxl.msg.title;

        if(!xxl.txtFrom) {
            xxl.txtFrom = xxl.msg.src;
        }

        xxl.txtBody = xxl.msg.body;
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
        },5000);
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
          if(ypos>=145) {
            break;
          }
          ypos+=21;
        }

        xxl.queueDraw();
    } catch (error) {
        g.drawString(error, 0,10);
    }
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







