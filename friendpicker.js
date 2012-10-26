$.fn.friendpicker = function(opts) {
	if (!window.FB) throw new Error('Facebook SDK is not loaded.');
	opts = opts || {};
	return this.each(function() {
		var friends, self = this, f = $(self);
		f.addClass('fbfriendpicker');
		FB.api('/me/friends', function(r) {
			
			var html=[];
			
			var selected = 0;
			friends = r.data;
			
			friends.sort(function(a,b) {
				a=a.name.split(' ').pop().toLowerCase();
				b=b.name.split(' ').pop().toLowerCase();
				if (a < b) return -1;
				if (a > b) return 1;
				return 0;
			});
			
			var filtered = friends.slice();
			var curbegin, curend;

			
			var container = $('<div class="container"></div>').appendTo(f), c=container[0];
			var virt = $('<div class="virt"></div>').appendTo(f);
			

			var pw,ph,fw,fh,rowSize;
			// calculate sizes
			function calcSizes() {
				var testEl = $('<a class="fbfp-friend">').appendTo(f);
				pw = f.width();
				ph = f.height();
				fw = testEl.outerWidth(true);
				fh = testEl.outerHeight(true);
				rowSize = Math.floor(container.width() / fw);
				testEl.remove();
			}
			calcSizes();
			f.bind('resize', function() {
				calcSizes();
				size();
			})

			size();
			f.scroll($.debounce(draw, 100));
			
			if (opts.filter) {
				var filter = $(opts.filter);
				filter.keyup($.debounce(function() {
					var q = this.val().toLowerCase();
					if (q.length == 0) filtered = friends.slice();
					else {
						filtered = [];
						for (var i = 0; i < friends.length; i++) {
							if (friends[i].name.toLowerCase().indexOf(q) >= 0) filtered.push(friends[i]);
						}
					}
					size();
				}, 250, filter));
			}
			
			
			function size() {
				virt.css('height',filtered.length/rowSize * fh + 'px');
				draw(true);
			}
			
			function draw(force) {
				var pos = f[0].scrollTop;
				
				var begin = Math.floor(pos / fh) * rowSize;
				var end = Math.ceil((pos+ph+fh) / fh) * rowSize;
				if (end > filtered.length) end = filtered.length;
				
				if (force || curbegin != begin || curend != end) {
				
					var html = '';
					
					for (var i = begin; i < end; i++) {
						html += '<a data-id="' + filtered[i].id + '" href="#" class="fbfp-friend' + (filtered[i].selected ? ' selected' : '') + '" style="top:' + (Math.floor(i/rowSize)*fh) + 'px; left:' + (i%rowSize*fw) + 'px;"><img src="//graph.facebook.com/' + filtered[i].id + '/picture" class="pic"> ' + filtered[i].name + '</a>';
						
					}
					c.innerHTML=html;
					curbegin = begin;
					curend = end;
				}
				
			}
			
			var counter;
			if (opts.counter) counter = $(opts.counter);
			$('.fbfp-friend', c).live('click', function(e) {
				e.preventDefault();
				var id = parseInt($(this).data('id'), 10);
				var u = get(id);
				var s = !u.selected;
				if (s && opts.max && selected >= opts.max) f.trigger('maxselect', [selected, opts.max]);
				else {
					u.selected = s;
					$(this).setClass('selected', s);
					if (s) selected++;
					else selected--;

					f.trigger('change', selected);
				}
				if (counter) counter.text(selected + ' friend' + (selected == 1 ? '' : 's') + ' selected');
			});
			
			function get(id) {
				for (var i = 0; i < friends.length; i++) if (friends[i].id == id) return friends[i];
			}
			
			f.data('selected', function() {
				var r=[];
				for (var i = 0; i < friends.length; i++) if (friends[i].selected) r.push(friends[i].id);
				return r;
			});
		});
	});
};

$.fn.setClass = function(className, value) {
	if (value) return this.addClass(className);
	return this.removeClass(className);
};

$.debounce = function(fn, timeout, invokeAsap, ctx) {
	if(arguments.length == 3 && typeof invokeAsap != 'boolean') {
		ctx = invokeAsap;
		invokeAsap = false;
	}

	var timer;

	return function() {

		var args = arguments;
		ctx = ctx || this;

		invokeAsap && !timer && fn.apply(ctx, args);

		clearTimeout(timer);

		timer = setTimeout(function() {
			!invokeAsap && fn.apply(ctx, args);
			timer = null;
		}, timeout);

	};

};