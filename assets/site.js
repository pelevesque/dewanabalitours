/**
 * Copyright (c) 2012 Sylvain Gougouzian (sylvain@gougouzian.fr) MIT
 * (http://www.opensource.org/licenses/mit-license.php) licensed. GNU GPL
 * (http://www.gnu.org/licenses/gpl.html) licensed.
 */
jQuery(function($) {
	$.fn.moodular = function(options) {
		var el = new Array();
		var opts = $.extend( {}, $.fn.moodular.defaults, options);
		var ctrls = $.extend( {}, $.fn.moodular.controls);
		var effects = $.extend( {}, $.fn.moodular.effects);
		this.each(function(i) {
			el[i] = new $moodular(this, opts, ctrls, effects);
		});
		return opts.api ? (el.length == 1 ? el[0] : el) : null;
	};
	$.moodular = function(e, opts, ctrls, effects) {
		this.e = $(e);
		if (opts.random) {
			var elems = $('>' + opts.item, this.e);
			elems.sort(function() {
				return (Math.round(Math.random()) - 0.5);
			});
			this.e.html('');
			for ( var i = 0; i < elems.length; i++)
				this.e.append(elems[i]);
		}
		$('>' + opts.item, this.e).each(function(i) {
			$(this).attr('data-position', i);
		});
		this.nbItems = $('>' + opts.item, this.e).length;
		this.current = 0;
		this.dir = 1;
		this.locked = false;
		this.temp = new Array();
		this.timerMoving = null;
		this.opts = opts;
		this.controls = ctrls;
		this.effects = effects;
		if (this.nbItems > 1)
			this._init();
	};
	var $moodular = $.moodular;
	$moodular.fn = $moodular.prototype = {
		moodular : '3.1'
	};
	$moodular.fn.extend = $moodular.extend = $.extend;
	$moodular.fn.extend( {
		_init : function() {
			var self = this;
			this.e.wrap('<div class="moodular_wrapper"></div>');
			this.e.parent().css( {
				'position' : 'relative',
				'overflow' : 'hidden',
				'width' : this.e.width(),
				'height' : this.e.height()
			});
			this.e.css( {
				'position' : 'absolute',
				'left' : 0,
				'top' : 0
			});
			this.control = this.opts.controls.split(' ');
			this.effect = this.opts.effects.split(' ');
			this._resize();
			if (this.opts.percentSize != 0) {
				$(window).bind('resize', function() {
					self._resizePercent();
				});
			}
			var i;
			$('>' + this.opts.item + ':first', this.e).addClass('current');
			for (i = 0; i < this.control.length; i++) {
				if ($.isFunction(this.controls.init[this.control[i]]))
					this.controls.init[this.control[i]](this);
			}
			for (i = 0; i < this.effect.length; i++) {
				if ($.isFunction(this.effects.init[this.effect[i]]))
					this.effects.init[this.effect[i]](this);
			}
			if (this.opts.auto) {
				this.timerMoving = setTimeout(function() {
					self.next();
				}, self.opts.dispTimeout);
			}
		},
		_resize : function() {
			var i;
			for (i = 0; i < this.effect.length; i++) {
				if ($.isFunction(this.effects.resize[this.effect[i]]))
					this.effects.resize[this.effect[i]](this);
			}
		},
		_resizePercent : function() {
			var tmp = this.e.parent().parent().width();
			this.e.parent().width(tmp * this.opts.percentSize);
			this._resize();
		},
		_move : function() {
			var i;
			for (i = 0; i < this.control.length; i++) {
				if ($.isFunction(this.controls.before[this.control[i]]))
					this.controls.before[this.control[i]](this);
			}
			for (i = 0; i < this.effect.length; i++) {
				if ($.isFunction(this.effects.before[this.effect[i]]))
					this.effects.before[this.effect[i]](this);
			}
			var self = this;
			if ($.isFunction(this.opts.move)) {
				this.opts.move(this, function() {
					self._afterMoving();
				});
			} else {
				var m = false;
				for (i = 0; i < this.effect.length; i++) {
					if ($.isFunction(this.effects.move[this.effect[i]])) {
						m = true;
						this.effects.move[this.effect[i]](this, function() {
							self._afterMoving();
						});
					}
				}
				if (!m) this._afterMoving();
			}
		},
		_afterMoving : function() {
			var self = this;
			for (i = 0; i < this.control.length; i++) {
				if ($.isFunction(this.controls.after[this.control[i]]))
					this.controls.after[this.control[i]](this);
			}
			for (i = 0; i < this.effect.length; i++) {
				if ($.isFunction(this.effects.after[this.effect[i]]))
					this.effects.after[this.effect[i]](this);
			}
			for (i = 0; i < this.opts.callbacks.length; i++) {
				this.opts.callbacks[i](this);
			}
			$('>' + this.opts.item, this.e).removeClass('current');
			$('>' + this.opts.item + '[data-position=' + this.current + ']', this.e).addClass('current');
			this.locked = false;
			this.dir = 1;
			if (this.opts.auto) {
				this.timerMoving = setTimeout(function() {
					self.next();
				}, this.opts.dispTimeout);
			}
		},
		start : function() {
			this.next();
			return false;
		},
		stop : function() {
			clearTimeout(this.timerMoving);
			return false;
		},
		next : function() {
			this.moveTo(parseInt(this.current) + 1);
			return false;
		},
		prev : function() {
			this.dir = -1;
			this.moveTo(parseInt(this.current) - 1);
			return false;
		},
		moveTo : function(n) {
			if (!this.locked) {
				this.locked = true;
				clearTimeout(this.timerMoving);
				if (n >= this.nbItems)
					n -= this.nbItems;
				if (n < 0)
					n += this.nbItems;
				this.current = n;
				this._move();
			}
		}
	});
	$.fn.moodular.defaults = {
		item : 'li',
		controls : '',
		effects : 'left',
		easing : '',
		auto : true,
		speed : 1000,
		dispTimeout : 3000,
		callbacks : [],
		random : false,
		percentSize : 0,
		api : false
	};
	$.fn.moodular.controls = {
		callback : {}
	};
	$.fn.moodular.effects = {
		init : {},
		move : {
			left: function (c, b) {
				c.e.animate( {
					left : (c.dir == 1 ? '-=' : '+=') + c.size + 'px'
				}, c.opts.speed, c.opts.easing, function() {
					b();
				});
			}
		},
		before : {
			left : function(m) {
				if (m.dir == -1) {
					m.e.prepend($('> ' + m.opts.item + ':last', m.e));
					m.e.css('left', '-' + m.size + 'px');
				} else {
					$('>' + m.opts.item + '[data-position=' + m.current + ']', m.e).insertAfter($('>' + m.opts.item + ':first', m.e));
				}
			}
		},
		after : {
			left : function(m) {
				if (m.dir == 1) {
					m.e.append($('> ' + m.opts.item + ':first', m.e));
					m.e.css('left', 0);
				}
			}
		},
		resize : {
			left: function (m) {
				m.size = parseInt(m.e.parent().width());
				m.e.width(2 * m.size + 'px');
				$('> ' + m.opts.item, m.e).width(m.size);
			}
		}
	};
	$.fn.moodular.controls = {
		init : {},
		before : {},
		after : {}
	};
});

/**
 * Copyright (c) 2012 Sylvain Gougouzian (sylvain@gougouzian.fr)
 * MIT (http://www.opensource.org/licenses/mit-license.php) licensed.
 * GNU GPL (http://www.gnu.org/licenses/gpl.html) licensed.
 *
 * jQuery moodular controls by Sylvain Gougouzian http://sylvain.gougouzian.fr
 */
jQuery(function($){
	$.extend($.fn.moodular.controls.init, {
		keys: function(m){
			$(document).keydown(function(event){
				if ((event.keyCode == 39) || (event.keyCode == 40)) {
					m.next();
					return false;
				}
				if ((event.keyCode == 37) || (event.keyCode == 38)) {
					m.prev();
					return false;
				}
			});
		},
		index: function(m){
			var h = '<ul>';
			for (var i = 0; i < m.nbItems; i++) {
				h += '<li class="moodular_itemList_li" rel="' + i + '"><span>' + (i + 1) + '</span></li>';
			}
			h += '<ul>';
			m.opts.indexElement.html(h);
			$('.moodular_itemList_li', m.opts.indexElement).css('cursor', 'pointer').click(function(){
				if(!m.locked && !$(this).hasClass('active')) {
					$('.moodular_itemList_li.active', m.opts.indexElement).removeClass('active');
					$(this).addClass('active');
					m.moveTo(parseInt($(this).attr('rel')));
				}
				return false;
			});
			$('.moodular_itemList_li:first', m.opts.indexElement).addClass('active');
		},
		wheel: function(m){
			m.e.parent().parent().bind("mousewheel", function(event, delta){
				var dir = delta > 0 ? 'Up' : 'Down';
				if (dir == 'Up') {
					m.next();
				}
				else {
					m.prev();
				}
				return false;
			});
		},
		touch: function(m){
			m.touchBPosX = null;
			m.touchBPosY = null;
			m.touchEPosX = null;
			m.touchEPosY = null;
			m.e.parent().bind('touchstart', function (event) {
				var e = event.originalEvent;
				m.touchBPosX = e.targetTouches[0].pageX;
				m.touchBPosY = e.targetTouches[0].pageY;
			}).bind('touchmove', function (event) {
				event.preventDefault();
				var e = event.originalEvent;
				m.touchEPosX = e.targetTouches[0].pageX;
				m.touchEPosY = e.targetTouches[0].pageY;
			}).bind('touchend', function(e) {
				if (m.vertical) {
					if (m.dir == 1) {
						if (m.touchEPosY < m.touchBPosY)
							m.next();
						else
							m.prev();
					}
					else {
						if (m.touchEPosY > m.touchBPosY)
							m.next();
						else
							m.prev();
					}
				}
				else {
					if (m.dir == 1) {
						if (m.touchEPosX < m.touchBPosX)
							m.next();
						else
							m.prev();
					}
					else {
						if (m.touchEPosX > m.touchBPosX)
							m.next();
						else
							m.prev();
					}
				}
				m.touchBPosX = null;
				m.touchBPosY = null;
				m.touchEPosX = null;
				m.touchEPosY = null;
				return false;
			});
		},
		buttons: function (m) {
			m.opts.bt_prev.bind('click', function () {
				m.prev();
				return false;
			});
			m.opts.bt_next.bind('click', function () {
				m.next();
				return false;
			});
		},
		stopOver: function (m) {
			$(m.e).bind('mouseenter', function () {
				clearTimeout(m.timerMoving);
				m.stop();
			}).bind('mouseleave', function () {
				m.timerMoving = setTimeout(function() {
					m.start();
				}, m.opts.dispTimeout);
			});
		},
		thumbs: function (m) {
			m.tC = m.opts.thumbsContainer.moodular({
				effects: 'multiple',
				api: true,
				auto: false,
				speed: m.opts.speed
			});
			m.thumbsClicked = false;
			$('>'+m.opts.thumbsItem, m.opts.thumbsContainer).bind('click', function () {
				if (!m.tC.locked && !$(this).hasClass('current')) {
					m.thumbsClicked = true;
					var t = $(this).data('position');
						n = t - m.tC.current;
					if (n >= m.nbItems)
						n -= m.nbItems;
					if (n < 0)
						n += m.nbItems;
					m.tC.nb_move = n;
					m.moveTo(t);
					m.tC.next();
				}
				return false;
			}).css('cursor', 'pointer');
		}
	});

	$.extend($.fn.moodular.controls.before, {
		index: function (m) {
			$('.moodular_itemList_li.active', m.opts.indexElement).removeClass('active');
			$('.moodular_itemList_li', m.opts.indexElement).eq(m.current).addClass('active');
		},
		thumbs: function (m) {
			if (!m.thumbsClicked) {
				if (m.dir == 1)
					m.tC.next();
				else
					m.tC.prev();
			}
		}
	});

	$.extend($.fn.moodular.controls.after, {
		thumbs: function (m) {
			m.thumbsClicked = false;
		}
	});
	
});

/**
 * Copyright (c) 2012 Sylvain Gougouzian (sylvain@gougouzian.fr)
 * MIT (http://www.opensource.org/licenses/mit-license.php) licensed.
 * GNU GPL (http://www.gnu.org/licenses/gpl.html) licensed.
 *
 * jQuery moodular effects by Sylvain Gougouzian http://sylvain.gougouzian.fr
 */
jQuery(function($) {
	$.extend($.fn.moodular.effects.init,{
		top: function (m) {
			m.vertical = true;
		},
		bottom: function (m) {
			m.vertical = true;
		},
		fade: function (m) {
			$('>' + m.opts.item, m.e).css({
				'position' : 'absolute',
				'z-index' : 1,
				'opacity' : 0
			});
			$('>' + m.opts.item + ':first', m.e).css({
				'z-index' : 3,
				'opacity' : 1
			});
			$('>' + m.opts.item, m.e).eq(1).css('z-index', 2);
		},
		legend: function (m) {
			m.opts.legendContainer.html($('> ' + m.opts.item + ':first .legend', m.e).html());
		},
		multiple: function (m) {
			m.nb_move = 1;
		}
	});
	$.extend($.fn.moodular.effects.move,{
		right: function (c, b) {
			c.e.animate({
				left: (c.dir == -1 ? '-=' : '+=') + c.size + 'px'
			}, c.opts.speed, c.opts.easing, function () { 
				b(); 
			});
		},
		top: function (c, b) {
			c.e.animate({
				top: (c.dir == 1 ? '-=' : '+=') + c.size + 'px'
			}, c.opts.speed, c.opts.easing, function () {
				b();
			});
		},
		bottom: function (c, b) {
			c.e.animate({
				top: (c.dir == -1 ? '-=' : '+=') + c.size + 'px'
			}, c.opts.speed, c.opts.easing, function () {
				b();
			});
		},
		fade: function (c, b) {
			$('>' + c.opts.item, c.e).css({
				'z-index' : 1,
				'opacity' : 0
			});
			$('>' + c.opts.item + '[data-position=' + c.current + ']', c.e).css({
				'z-index' : 2,
				'opacity' : 1
			});
			$('>' + c.opts.item + '.current', c.e).css({
				'z-index' : 3,
				'opacity' : 1
			}).animate({
				opacity: 0
			}, c.opts.speed, c.opts.easing, function () {
				b();
			});
		},
		multiple: function (c, b) {
			c.e.animate( {
				left : (c.dir == 1 ? '-=' : '+=') + c.size * c.nb_move + 'px'
			}, c.opts.speed, c.opts.easing, function() {
				b();
			});
		}
	});
	$.extend($.fn.moodular.effects.before,{
		right: function (m) {
			if (m.dir == 1) {
				m.e.prepend($('>' + m.opts.item, m.e).eq(1));
				m.e.css('left', '-' + m.size + 'px');
			} else {
				$('>' + m.opts.item + ':last', m.e).insertAfter($('>' + m.opts.item + ':first', m.e));
			}
		},
		top: function (m) {
			if (m.dir == -1) {
				m.e.prepend($('>' + m.opts.item + ':last', m.e));
				m.e.css('top', '-' + m.size + 'px');
			} else {
				$('>' + m.opts.item + '[data-position=' + m.current + ']', m.e).insertAfter($('>' + m.opts.item + ':first', m.e));
			}
		},
		bottom: function (m) {
			if (m.dir == 1) {
				m.e.prepend($('> ' + m.opts.item, m.e).eq(1));
				m.e.css('top', '-' + m.size + 'px');
			} else {
				$('>' + m.opts.item + ':last', m.e).insertAfter($('>' + m.opts.item + ':first', m.e));
			}
		},
		legend: function (m) {
			m.opts.legendContainer.fadeOut(m.opts.legendSpeed);
		},
		multiple: function (m) {
			if (m.dir == -1) {
				for (var i = 0; i < m.nb_move; i++)
					m.e.prepend($('> ' + m.opts.item + ':last', m.e));
				m.e.css('left', '-' + m.size + 'px');
			}
		}
	});
	$.extend($.fn.moodular.effects.after,{
		right: function (m) {
			if (m.dir == 1) {
				m.e.append($('> ' + m.opts.item, m.e).eq(1));
			} else {
				$('>' + m.opts.item + ':first', m.e).insertAfter($('>' + m.opts.item, m.e).eq(1));
				m.e.css('left', 0);
			}
		},
		top: function (m) {
			if (m.dir == 1) {
				m.e.append($('> ' + m.opts.item + ':first', m.e));
				m.e.css('top', 0);
			}
		},
		bottom: function (m) {
			if (m.dir == 1) {
				m.e.append($('> ' + m.opts.item, m.e).eq(1));
			} else {
				$('>' + m.opts.item + ':first', m.e).insertAfter($('>' + m.opts.item, m.e).eq(1));
				m.e.css('top', 0);
			}
		},
		fade: function (m) {
			$('>' + m.opts.item, m.e).css('z-index', 1);
			$('>' + m.opts.item + '[data-position=' + m.current + ']', m.e).css('z-index', 2);
		},
		legend: function (m) {
			m.opts.legendContainer.html($('.legend', $('> ' + m.opts.item + '[data-position=' + m.current + ']', m.e)).html()).fadeIn(m.opts.legendSpeed);
		},
		multiple: function (m) {
			if (m.dir == 1) {
				for (var i = 0; i < m.nb_move; i++)
					m.e.append($('> ' + m.opts.item + ':first', m.e));
				m.e.css('left', 0);
			}
			m.current = $('>' + m.opts.item, m.e).data('position');
			m.nb_move = 1;
		}
	});
	$.extend($.fn.moodular.effects.resize,{
		right: function (m) {
			m.size = parseInt(m.e.parent().width());
			m.e.width(2 * m.size + 'px');
			$('> ' + m.opts.item, m.e).width(m.size);
		},
		top: function (m) {
			m.size = parseInt(m.e.parent().height());
			m.e.height(2 * m.size + 'px');
			$('>' + m.opts.item, m.e).height(m.size);
		},
		bottom: function (m) {
			m.size = parseInt(m.e.parent().height());
			m.e.height(2 * m.size + 'px');
			$('>' + m.opts.item, m.e).height(m.size);
		},
		multiple: function (m) {
			m.size = parseInt(m.e.parent().width());
			m.e.width(2 * m.size + 'px');
			var mif = $('>' + m.opts.item + ':first', m.e);
			if (m.vertical) {
				m.size = parseInt(mif.outerHeight(true));
			} else {
				m.size = parseInt(mif.outerWidth(true));
			}
		}
	});
});

/*
	Slimbox v2.04 - The ultimate lightweight Lightbox clone for jQuery
	(c) 2007-2010 Christophe Beyls <http://www.digitalia.be>
	MIT-style license.
*/
(function(w){var E=w(window),u,f,F=-1,n,x,D,v,y,L,r,m=!window.XMLHttpRequest,s=[],l=document.documentElement,k={},t=new Image(),J=new Image(),H,a,g,p,I,d,G,c,A,K;w(function(){w("body").append(w([H=w('<div id="lbOverlay" />')[0],a=w('<div id="lbCenter" />')[0],G=w('<div id="lbBottomContainer" />')[0]]).css("display","none"));g=w('<div id="lbImage" />').appendTo(a).append(p=w('<div style="position: relative;" />').append([I=w('<a id="lbPrevLink" href="#" />').click(B)[0],d=w('<a id="lbNextLink" href="#" />').click(e)[0]])[0])[0];c=w('<div id="lbBottom" />').appendTo(G).append([w('<a id="lbCloseLink" href="#" />').add(H).click(C)[0],A=w('<div id="lbCaption" />')[0],K=w('<div id="lbNumber" />')[0],w('<div style="clear: both;" />')[0]])[0]});w.slimbox=function(O,N,M){u=w.extend({loop:false,overlayOpacity:0.8,overlayFadeDuration:400,resizeDuration:400,resizeEasing:"swing",initialWidth:250,initialHeight:250,imageFadeDuration:400,captionAnimationDuration:400,counterText:"Image {x} of {y}",closeKeys:[27,88,67],previousKeys:[37,80],nextKeys:[39,78]},M);if(typeof O=="string"){O=[[O,N]];N=0}y=E.scrollTop()+(E.height()/2);L=u.initialWidth;r=u.initialHeight;w(a).css({top:Math.max(0,y-(r/2)),width:L,height:r,marginLeft:-L/2}).show();v=m||(H.currentStyle&&(H.currentStyle.position!="fixed"));if(v){H.style.position="absolute"}w(H).css("opacity",u.overlayOpacity).fadeIn(u.overlayFadeDuration);z();j(1);f=O;u.loop=u.loop&&(f.length>1);return b(N)};w.fn.slimbox=function(M,P,O){P=P||function(Q){return[Q.href,Q.title]};O=O||function(){return true};var N=this;return N.unbind("click").click(function(){var S=this,U=0,T,Q=0,R;T=w.grep(N,function(W,V){return O.call(S,W,V)});for(R=T.length;Q<R;++Q){if(T[Q]==S){U=Q}T[Q]=P(T[Q],Q)}return w.slimbox(T,U,M)})};function z(){var N=E.scrollLeft(),M=E.width();w([a,G]).css("left",N+(M/2));if(v){w(H).css({left:N,top:E.scrollTop(),width:M,height:E.height()})}}function j(M){if(M){w("object").add(m?"select":"embed").each(function(O,P){s[O]=[P,P.style.visibility];P.style.visibility="hidden"})}else{w.each(s,function(O,P){P[0].style.visibility=P[1]});s=[]}var N=M?"bind":"unbind";E[N]("scroll resize",z);w(document)[N]("keydown",o)}function o(O){var N=O.keyCode,M=w.inArray;return(M(N,u.closeKeys)>=0)?C():(M(N,u.nextKeys)>=0)?e():(M(N,u.previousKeys)>=0)?B():false}function B(){return b(x)}function e(){return b(D)}function b(M){if(M>=0){F=M;n=f[F][0];x=(F||(u.loop?f.length:0))-1;D=((F+1)%f.length)||(u.loop?0:-1);q();a.className="lbLoading";k=new Image();k.onload=i;k.src=n}return false}function i(){a.className="";w(g).css({backgroundImage:"url("+n+")",visibility:"hidden",display:""});w(p).width(k.width);w([p,I,d]).height(k.height);w(A).html(f[F][1]||"");w(K).html((((f.length>1)&&u.counterText)||"").replace(/{x}/,F+1).replace(/{y}/,f.length));if(x>=0){t.src=f[x][0]}if(D>=0){J.src=f[D][0]}L=g.offsetWidth;r=g.offsetHeight;var M=Math.max(0,y-(r/2));if(a.offsetHeight!=r){w(a).animate({height:r,top:M},u.resizeDuration,u.resizeEasing)}if(a.offsetWidth!=L){w(a).animate({width:L,marginLeft:-L/2},u.resizeDuration,u.resizeEasing)}w(a).queue(function(){w(G).css({width:L,top:M+r,marginLeft:-L/2,visibility:"hidden",display:""});w(g).css({display:"none",visibility:"",opacity:""}).fadeIn(u.imageFadeDuration,h)})}function h(){if(x>=0){w(I).show()}if(D>=0){w(d).show()}w(c).css("marginTop",-c.offsetHeight).animate({marginTop:0},u.captionAnimationDuration);G.style.visibility=""}function q(){k.onload=null;k.src=t.src=J.src=n;w([a,g,c]).stop(true);w([I,d,g,G]).hide()}function C(){if(F>=0){q();F=x=D=-1;w(a).hide();w(H).stop().fadeOut(u.overlayFadeDuration,j)}return false}})(jQuery);

// ORIGINAL AUTOLOAD CODE BLOCK
// if (!/android|iphone|ipod|series60|symbian|windows ce|blackberry/i.test(navigator.userAgent)) {
//  jQuery(function($) {
//     $("a[rel^='lightbox']").slimbox({/* Put custom options here */}, null, function(el) {//
//       return (this == el) || ((this.rel.length > 8) && (this.rel == el.rel));
//     });
//  });
// }

// AUTOLOAD CODE BLOCK (MAY BE CHANGED OR REMOVED)
if (!/android|iphone|ipod|series60|symbian|windows ce|blackberry/i.test(navigator.userAgent)) {
	jQuery(function($) {
		$('ul[role="gallery"] li a').slimbox({/* Put custom options here */}, null, function(el) {
			return true;
		});
	});
}

/*! waitForImages jQuery Plugin - v1.4.1 - 2012-10-12
* https://github.com/alexanderdickson/waitForImages
* Copyright (c) 2012 Alex Dickson; Licensed MIT */
(function(e){var t="waitForImages";e.waitForImages={hasImageProperties:["backgroundImage","listStyleImage","borderImage","borderCornerImage"]},e.expr[":"].uncached=function(t){if(!e(t).is('img[src!=""]'))return!1;var n=new Image;return n.src=t.src,!n.complete},e.fn.waitForImages=function(n,r,i){var s=0,o=0;e.isPlainObject(arguments[0])&&(n=arguments[0].finished,r=arguments[0].each,i=arguments[0].waitForAll),n=n||e.noop,r=r||e.noop,i=!!i;if(!e.isFunction(n)||!e.isFunction(r))throw new TypeError("An invalid callback was supplied.");return this.each(function(){var u=e(this),a=[],f=e.waitForImages.hasImageProperties||[],l=/url\(\s*(['"]?)(.*?)\1\s*\)/g;i?u.find("*").andSelf().each(function(){var t=e(this);t.is("img:uncached")&&a.push({src:t.attr("src"),element:t[0]}),e.each(f,function(e,n){var r=t.css(n),i;if(!r)return!0;while(i=l.exec(r))a.push({src:i[2],element:t[0]})})}):u.find("img:uncached").each(function(){a.push({src:this.src,element:this})}),s=a.length,o=0,s===0&&n.call(u[0]),e.each(a,function(i,a){var f=new Image;e(f).bind("load."+t+" error."+t,function(e){o++,r.call(a.element,o,s,e.type=="load");if(o==s)return n.call(u[0]),!1}),f.src=a.src})})}})(jQuery);

/**
 *  Site Slideshow
 **/
jQuery(document).ready(function () {	
	// Do not use the slideshow if CSS is not activated.
	if ($('header hgroup h1').css('display') == 'none')
	{
		var slideshow = '<ul class="slideshow">';
		slideshow += '<li><img src="assets/images/slideshow/uluwatu.jpg" alt="uluwatu"></li>';
		slideshow += '<li><img src="assets/images/slideshow/bath.jpg" alt="bath"></li>';
		slideshow += '<li><img src="assets/images/slideshow/village.jpg" alt="village"></li>';
		slideshow += '<li><img src="assets/images/slideshow/temple.jpg" alt="temple"></li>';
		slideshow += '</ul>';
		$('header nav').after(slideshow);
		$('header .slideshow').waitForImages(function() {
			$('header hgroup').css('display', 'none');
			$('header .slideshow').moodular({
				effects: 'fade',
				auto: true,
				speed: 3000,
				dispTimeout: 3000
			});
		});
	}
});
