// function to calculate background gradient from the wavelength value
function nmToRGB(wavelength){
    var Gamma = 0.80,
    IntensityMax = 255,
    factor, red, green, blue;
    if((wavelength >= 380) && (wavelength<440)){
        red = -(wavelength - 440) / (440 - 380);
        green = 0.0;
        blue = 1.0;
    }else if((wavelength >= 440) && (wavelength<490)){
        red = 0.0;
        green = (wavelength - 440) / (490 - 440);
        blue = 1.0;
    }else if((wavelength >= 490) && (wavelength<510)){
        red = 0.0;
        green = 1.0;
        blue = -(wavelength - 510) / (510 - 490);
    }else if((wavelength >= 510) && (wavelength<580)){
        red = (wavelength - 510) / (580 - 510);
        green = 1.0;
        blue = 0.0;
    }else if((wavelength >= 580) && (wavelength<645)){
        red = 1.0;
        green = -(wavelength - 645) / (645 - 580);
        blue = 0.0;
    }else if((wavelength >= 645) && (wavelength<781)){
        red = 1.0;
        green = 0.0;
        blue = 0.0;
    }else{
        red = 0.0;
        green = 0.0;
        blue = 0.0;
    };
    // Let the intensity fall off near the vision limits
    if((wavelength >= 380) && (wavelength<420)){
        factor = 0.3 + 0.7*(wavelength - 380) / (420 - 380);
    }else if((wavelength >= 420) && (wavelength<701)){
        factor = 1.0;
    }else if((wavelength >= 701) && (wavelength<781)){
        factor = 0.3 + 0.7*(780 - wavelength) / (780 - 700);
    }else{
        factor = 0.0;
    };
    if (red !== 0){
        red = Math.round(IntensityMax * Math.pow(red * factor, Gamma));
    }
    if (green !== 0){
        green = Math.round(IntensityMax * Math.pow(green * factor, Gamma));
    }
    if (blue !== 0){
        blue = Math.round(IntensityMax * Math.pow(blue * factor, Gamma));
    }
    return [red,green,blue];
}

// applying background gradient
function makebg(element, wavelength){
    var v = nmToRGB(wavelength);
    var color = d3.rgb(v[0], v[1], v[2]);
    var c1 = color;
    var c2 = color.darker(2);
    element.css({
        background: "linear-gradient(135deg, "+c2+" 0%,"+c1+" 100%)"
    });
    if(!element.hasClass("colored")){
        element.addClass("colored");
    }
}

// resetting background gradient
function resetbg(element){
    if(element.hasClass("colored")){
        element.removeClass("colored");
        element.css({
            "background": "transparent"
        });
    }
}

// selected element for fullscreen mode
var selected = null;

// data to compare with and decide if background should be changed
var oldData = [0,0,0,0,0,0,0,0];

function parseData(d){
    for (var ch = 0; ch < d.length; ch++) {
        var element = $('#wl'+ch).parent();
        if(d[ch]>100){
            var wl = d[ch].toFixed(precision);
            $('#wl'+ch).html(wl);
            // recalc background only if wavelength changed by 1nm or more
            if(Math.abs(d[ch]-oldData[ch])>1){
                oldData[ch] = d[ch];
                makebg(element, d[ch]);
            }
        }else{
            $('#wl'+ch).html("No data");
            oldData[ch] = d[ch];
            resetbg(element);
        }
    }
};

ws = new WebSocket("ws://"+location.host+"/ws/");
ws.onmessage = function(e) {
    parseData(JSON.parse(e.data));
};

// make wavelength value fullscreen
function resizeFont(){
	var w = $(document).width();
	var fontsize = w/(precision+4);
	$(selected).find(".data").css({
		"font-size": fontsize+"px",
		"line-height": "130%",
	});
}

// selecting channel for fullscreen mode
$(".container > div").on("click", function(){
	if(selected != this){
    	selected = this;
    	$(".container > div").hide();
    	$(this).show();
    	resizeFont();
	}else{
		selected = null;
    	$(".container > div").show();
    	$(".container > div > .data").css({
    		"font-size": "",
    		"line-height": "",
    	});
	}
});

// changing font size on resize of the window
$(window).resize(function(){
	if(selected != null){
		resizeFont();
	}
});

parseData(data);