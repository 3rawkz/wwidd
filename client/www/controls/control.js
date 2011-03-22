////////////////////////////////////////////////////////////////////////////////
// Control Base
//
// 'Abstract' base class for UI controls.
////////////////////////////////////////////////////////////////////////////////
var yalp = yalp || {};

yalp.controls = function (controls, $) {
	var LAST_ID = 0;
	
	// generates a new, unique control id
	controls.id = function () {
		return 'y' + LAST_ID++;
	};
	
	// control lookup (id -> control)
	controls.lookup = {};
	controls.count = 0;
	
	// base control class
	controls.control = function () {
		var id = controls.id(),
		
		self =  {
			// properties
			id: id,							// id is automatically assigned
			parent: null,				// parent control
			children: [],				// child controls
			data: [],						// data associated with control
	
			// adds a child to the control
			append: function (child) {
				this.children.push(child);
				child.parent = this;
				return this;
			},
			
			// removes control and frees resources
			remove: function () {
				this.clear();
				delete controls.lookup[this.id];
				controls.count--;
				return this;
			},
			
			// adds control to parent as child
			appendTo: function (parent) {
				this.parent = parent;
				parent.children.push(this);
				return this;
			},
			
			// removes child controls
			clear: function () {
				var children = this.children,
						i;
				for (i = 0; i < children.length; i++) {
					children[i].remove();
				}
				children.length = 0;
				return this;
			},
			
			// initializes the control
			// e.g. adding data, events, etc.
			init: null,
			
			// produces the control's html
			html: function () {
				throw "Abstract";
			},
			
			// renders the control
			// - parent: parent jQuery object
			render: function (parent) {
				// initializing jQuery object from full control markup
				var elem = $(this.html()),
						target = parent ? null : $('#' + this.id);

				// adding control to dom
				if (parent) {
					parent.append(elem);
				} else if (target.length) {
					target.replaceWith(elem);
				}

				// applying instance-level events
				(function inner(control) {
					var selector = '#' + control.id,
							i,
					// initializing current control
					result = !control.init ? true :
						control.init(elem.is(selector) ? elem : elem.find(selector));
					// initializing children
					for (i = 0; i < control.children.length; i++) {
						inner(control.children[i]);
					}
					return result;
				}(this));
				
				return parent || elem;
			}
		};
		
		// adding control to lookup
		controls.lookup[id] = self;
		controls.count++;

		return self;
	};

	return controls;
}(yalp.controls || {},
	jQuery);
