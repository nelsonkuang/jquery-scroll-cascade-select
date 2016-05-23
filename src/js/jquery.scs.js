(function(root, $) {
    root.SCS = {
        version: '1.0.0'
    };

    //default settings
    SCS.defaults = {
        navArr: [ //province，city，district
            { title: "省", id: "scs_items_prov" },
            { title: "市", id: "scs_items_city" },
            { title: "区", id: "scs_items_dist" }
        ],
        skinCss: '', //customize skin by adding an extra class
        onOk: function(selectedKey, selectedValue) {}, //trigger when click on ok, the selectedDey and selectedValue can be used directly
        onCancel: function() {} //trigger when click on cancel
    };

    SCS.init = function(options) {
        var options = $.extend({}, SCS.defaults, options);
        var html = '',
            navArr = options.navArr;
        html += '<div class="cascade_scroll_selects ' + options.skinCss + '" id="cascade_scroll_selects"><div class="scs_container"><div class="scs_cover"></div><div class="scs_dialog"><div class="scs_selects">';
        navArr.forEach(function(nav) {
            html += '<div class="scs_selects_group"><div class="scs_selects_group_title">' + nav.title + '</div><div class="scs_selects_group_view"><div class="scs_items" data-height="240" id="' + nav.id + '"></div></div></div>';
        });
        html += '</div><div class="scs_btns"><div class="scs_btn_span"></div><div class="scs_btn scs_btn_ok">确定</div><div class="scs_btn scs_btn_cancel">取消</div></div></div></div></div>';
        $("#cascade_scroll_selects").remove(); //make sure only one SCS is running
        $("body").append(html);
        var This = $("#cascade_scroll_selects");
        This.find(".scs_dialog").slideDown(300);

        //bind click events
        This.find(".scs_cover").click(function() {
            This.find(".scs_dialog").slideUp(200, function() {
                This.remove();
            });
        });
        This.find(".scs_btn_ok").click(function() {
            var selectedKey = '',
                selectedValue = '';
            $("#cascade_scroll_selects").find(".scs_selected").each(function(n) {
                var $obj = $(this);
                if (n != 0) {
                    selectedKey += ("-" + $obj.attr("data-val"));
                    selectedValue += (" " + $obj.html());
                } else {
                    selectedKey = $obj.attr("data-val");
                    selectedValue = $obj.html();
                }
            });
            options.onOk(selectedKey, selectedValue);
            This.find(".scs_dialog").slideUp(200, function() {
                This.remove();
            });
        });
        This.find(".scs_btn_cancel").click(function() {
            options.onCancel();
            This.find(".scs_dialog").slideUp(200, function() {
                This.remove();
            });
        });
    }

    SCS.destroy = function(callback) { //destroy SCS
        if (typeof callback === 'function')
            callback();
        var This = $("#cascade_scroll_selects");
        This.find(".scs_dialog").slideUp(200, function() {
            This.remove();
        });
    }

    //a scroller class
    SCS.scrollCascadeSelect = function(options) {
        var defaults = {
            el: undefined,
            dataArr: [],
            startIndex: 0,
            onInit: function(selectedItem, selectedIndex) {}, //exposing the selectedItem and selectIndex parameters for outter using
            onChange: function(selectedItem, selectedIndex) {} //exposing the selectedItem and selectIndex parameters for outter using
        };
        var options = $.extend({}, defaults, options);
        var This = $(options.el),
            el = This.get(0),
            dataArr = options.dataArr,
            startIndex = options.startIndex,
            _self = this; //use '_self' to store 'this' in case of some misunderstanding.
        var isDown = false,
            havedClicked = false,
            startPosY = 0,
            currentPosY = 0,
            startTranslatedY = 0,
            currentTranslatedY = startTranslatedY,
            startTime = 0,
            endTime = 0,
            lastTime = (new Date()).getTime(),
            lastPosY = 0,
            lastV = 0,
            supportedTouch = true;
        try { ontouchstart; } catch (e) { supportedTouch = false; }
        //exposing the selected item and index for outter use
        _self.selectedIndex = startIndex;
        _self.getSelectedItem = function() {
            return dataArr[this.selectedIndex];
        };
        if (supportedTouch) {
            //bind all the touch events
            el.addEventListener('touchstart', function(e) {
                currentPosY = startPosY = e.changedTouches[0].pageY;
                startTime = (new Date()).getTime();
                startTranslatedY = parseInt(This.css("webkitTransform").split(",").pop().replace(" ", "").replace(")", ""));
                lastV = 0;
            }, false);

            el.addEventListener('touchmove', function(e) {
                event.preventDefault(); //prevent default scrolling event when touch moving
                lastV = (e.changedTouches[0].pageY - lastPosY) / ((new Date()).getTime() - lastTime);
                currentPosY = e.changedTouches[0].pageY;
                currentTranslatedY = startTranslatedY + currentPosY - startPosY;
                This.css({
                    '-webkit-transition': '-webkit-transform ' + 0 + 's ease-out',
                    '-webkit-transform': 'translate3d(0, ' + currentTranslatedY + 'px, 0)'
                });
                lastPosY = currentPosY;
                lastTime = (new Date()).getTime();
            }, false);

            el.addEventListener('touchend', function(e) {
                endTime = (new Date()).getTime();
                if (Math.abs(currentPosY - startPosY) > 5 && endTime - startTime > 50) {
                    var v = lastV,
                        s = v > 0 ? 0.5 * v * v / 0.001 : -0.5 * v * v / 0.001,
                        t = Math.abs(v) / 0.001;
                    currentTranslatedY = parseInt(This.css("webkitTransform").split(",").pop().replace(" ", "").replace(")", ""));
                    currentTranslatedY += s;
                    var residue = currentTranslatedY % 40;
                    if (Math.abs(residue) >= 20) {
                        if (residue < 0)
                            currentTranslatedY += ((40 + residue) * -1);
                        else {
                            currentTranslatedY += (40 - residue);
                        }
                    } else {
                        currentTranslatedY -= residue;
                    }
                    if (currentTranslatedY > 80) {
                        currentTranslatedY = 80;
                    } else if (currentTranslatedY < (This.attr("data-height") - 120) * (-1)) {
                        currentTranslatedY = (This.attr("data-height") - 120) * (-1);
                    }
                    This.css({
                        '-webkit-transition': '-webkit-transform ' + t / 1000 + 's ease-out',
                        '-webkit-transform': 'translate3d(0, ' + currentTranslatedY + 'px, 0)'
                    });
                    _self.selectedIndex = Math.abs((currentTranslatedY - 80) / (-40));
                    This.find(".scs_item").removeClass("scs_selected").eq(_self.selectedIndex).addClass("scs_selected");
                    options.onChange(_self.getSelectedItem(), _self.selectedIndex); //trigger onChange event
                    havedClicked = false;
                } else {
                    havedClicked = true;
                }
                startPosY = 0;
                currentPosY = 0;
                startTranslatedY = 0;
                currentTranslatedY = 0;
                startTime = endTime = 0;
                lastPosY = lastV = 0;
            }, false);
        } else {
            //bind all the mouse events
            el.addEventListener("mousedown", mouseDown);
                
            function mouseDown(e) { //mouse down event
                isDown = true;
                currentPosY = startPosY = e.pageY;
                startTime = (new Date()).getTime();
                startTranslatedY = parseInt(This.css("webkitTransform").split(",").pop().replace(" ", "").replace(")", ""));
                el.addEventListener("mousemove", mouseMove);
                el.addEventListener("mouseup", mouseUp);
                el.addEventListener("mouseleave", mouseLeave);
            }

            function mouseMove(e) { //mouse move event
                if (isDown) {
                    lastV = (e.pageY - lastPosY) / ((new Date()).getTime() - lastTime);
                    currentPosY = e.pageY;
                    currentTranslatedY = startTranslatedY + currentPosY - startPosY;
                    This.css({
                        '-webkit-transition': '-webkit-transform ' + 0 + 's ease-out',
                        '-webkit-transform': 'translate3d(0, ' + currentTranslatedY + 'px, 0)'
                    });
                    lastPosY = currentPosY;
                    lastTime = (new Date()).getTime();
                    havedClicked = false;
                }
            }

            function mouseUp(e) { //mouse up event
                endTime = (new Date()).getTime();              
                if (Math.abs(currentPosY - startPosY) > 5 && endTime - startTime > 20) {
                    var v = lastV,
                        s = v > 0 ? 0.5 * v * v / 0.001 : -0.5 * v * v / 0.001,
                        t = Math.abs(v) / 0.001;
                    currentTranslatedY = parseInt(This.css("webkitTransform").split(",").pop().replace(" ", "").replace(")", ""));
                    currentTranslatedY += s;

                    var residue = currentTranslatedY % 40;
                    if (Math.abs(residue) >= 20) {
                        if (residue < 0)
                            currentTranslatedY += ((40 + residue) * -1);
                        else {
                            currentTranslatedY += (40 - residue);
                        }
                    } else {
                        currentTranslatedY -= residue;
                    }
                    if (currentTranslatedY > 80) {
                        currentTranslatedY = 80;
                    } else if (currentTranslatedY < (This.attr("data-height") - 120) * (-1)) {
                        currentTranslatedY = (This.attr("data-height") - 120) * (-1);
                    }
                    This.css({
                        '-webkit-transition': '-webkit-transform ' + t / 1000 + 's ease-out',
                        '-webkit-transform': 'translate3d(0, ' + currentTranslatedY + 'px, 0)'
                    });
                    _self.selectedIndex = Math.abs((currentTranslatedY - 80) / (-40));
                    This.find(".scs_item").removeClass("scs_selected").eq(_self.selectedIndex).addClass("scs_selected");
                    options.onChange(_self.getSelectedItem(), _self.selectedIndex); //trigger onChange event
                } else {
                    havedClicked = true;
                }
                isDown = false;
                startPosY = 0;
                currentPosY = 0;
                startTranslatedY = 0;
                currentTranslatedY = 0;
                startTime = endTime = 0;
                lastPosY = lastV = 0;
                el.removeEventListener("mousemove", mouseMove);
                el.removeEventListener("mouseup", mouseUp);
                el.removeEventListener("mouseleave", mouseLeave);
            }

            function mouseLeave(e) {
                if (isDown) {
                    endTime = (new Date()).getTime();
                    if (Math.abs(currentPosY - startPosY) > 5 && endTime - startTime > 20) { //exclude the 'click' event
                        var v = lastV,
                            s = v > 0 ? 0.5 * v * v / 0.001 : -0.5 * v * v / 0.001,
                            t = Math.abs(v) / 0.001;
                        currentTranslatedY = parseInt(This.css("webkitTransform").split(",").pop().replace(" ", "").replace(")", ""));
                        currentTranslatedY += s;
                        residue = currentTranslatedY % 40;
                        if (Math.abs(residue) >= 20) {
                            if (residue < 0)
                                currentTranslatedY += ((40 + residue) * -1);
                            else {
                                currentTranslatedY += (40 - residue);
                            }
                        } else {
                            currentTranslatedY -= residue;
                        }
                        if (currentTranslatedY > 80) {
                            currentTranslatedY = 80;
                        } else if (currentTranslatedY < (This.attr("data-height") - 120) * (-1)) {
                            currentTranslatedY = (This.attr("data-height") - 120) * (-1);
                        }
                        This.css({
                            '-webkit-transition': '-webkit-transform ' + t / 1000 + 's ease-out',
                            '-webkit-transform': 'translate3d(0, ' + currentTranslatedY + 'px, 0)'
                        });
                        _self.selectedIndex = Math.abs((currentTranslatedY - 80) / (-40));
                        This.find(".scs_item").removeClass("scs_selected").eq(_self.selectedIndex).addClass("scs_selected");
                        options.onChange(_self.getSelectedItem(), _self.selectedIndex); //trigger onChange event
                    } else {
                        havedClicked = true;
                    }
                }
                isDown = false;
                startPosY = 0;
                currentPosY = 0;
                startTranslatedY = 0;
                currentTranslatedY = 0;
                startTime = endTime = 0;
                lastPosY = lastV = 0;
                el.removeEventListener("mousemove", mouseMove);
                el.removeEventListener("mouseup", mouseUp);
                el.removeEventListener("mouseleave", mouseLeave);
            }
        }

        //bind a click event
        This.on("click", ".scs_item", function(e) {
            if (havedClicked) {
                var That = $(this),
                    itemPositionY = That.position().top,
                    currentTranslatedY = 80 - itemPositionY;
                This.css({
                    '-webkit-transition': '-webkit-transform ' + 0 + 's ease-out',
                    '-webkit-transform': 'translate3d(0, ' + currentTranslatedY + 'px, 0)'
                });
                This.find(".scs_item").removeClass("scs_selected");
                That.addClass("scs_selected");
                _self.selectedIndex = Math.abs((currentTranslatedY - 80) / (-40));
                options.onChange(_self.getSelectedItem(), _self.selectedIndex); //trigger onChange event
                havedClick = false;
            }
        });

        //a public out-exposing function, render / re-render the scroller, based on the parameters 'newDataArr' and 'newStartIndex' 
        _self.render = function(newDataArr, newStartIndex, callback) {
            var html = "",
                sIndex = newStartIndex || 0,
                currentTranslatedY = 80 - sIndex * 40;
            if (newDataArr != undefined)
                newDataArr.forEach(function(obj, index) {
                    if (sIndex != index)
                        html += '<div class="scs_item" data-val="' + obj.key + '">' + obj.val + '</div>';
                    else {
                        html += '<div class="scs_item scs_selected" data-val="' + obj.key + '">' + obj.val + '</div>';
                    }
                });
            else {
                This.html(html);
                return;
            }
            This.html(html);
            This.attr("data-height", newDataArr.length * 40);
            This.css('-webkit-transform', 'translate3d(0, ' + currentTranslatedY + 'px, 0)');
            This.css('transform', 'translate3d(0, ' + currentTranslatedY + 'px, 0)');
            _self.selectedIndex = sIndex;
            dataArr = newDataArr;
            if (typeof callback === 'function')
                callback();

        };

        //private funtion，initialization
        var init = function() {
            _self.render(dataArr, startIndex);
            options.onInit(_self.getSelectedItem(), _self.selectedIndex); //trigger the onInit callback function
        };

        init(); //bootstrap a scroller
    }
})(this, jQuery);
