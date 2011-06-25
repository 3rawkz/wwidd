////////////////////////////////////////////////////////////////////////////////
// General Purpose Linked Chain
////////////////////////////////////////////////////////////////////////////////
/*global require, exports, setTimeout */
var

// - handler: function to call on each element
chain = function (handler) {
	var stopped = false,	// whether processing is stopped

	// first element of the chain	
	first = null,
	lookup = {},
	length = 0,
	
	// event handlers
	onFinished = function (result) {},	// runs when process finished
	onProgress = function (retval) {},	// runs after preocessing each link

	self = {
		// adds an elemet to start of chain
		add: function (elem) {
			// current first becomes second
			var second = first;

			// constructing new first link
			first = {
				load: elem,
				prev: null,
				next: second
			};
			
			// updating second to point at first
			if (second) {
				second.prev = first;
			}
			
			// adding link to lookup
			lookup[elem] = first;
			length++;
			
			return self;
		},
		
		// removes an element from chain
		unlink: function (elem) {
			// looking up link
			var link = lookup[elem],
					prev = link.prev,
					next = link.next;

			// removing reference from lookup
			delete lookup[elem];
			length--;
			
			if (link === first) {
				// removing first link
				first = link.next;
				if (first) {
					first.prev = null;
				}
			} else {					
				// pairing up previous and next links
				// current link is no more in the chain
				if (prev) {
					prev.next = next;
				}
				if (next) {
					next.prev = prev;
				}
			}
			
			return self;
		},
		
		// clears chain
		clear: function () {
			first = null;
			lookup = {};
			length = 0;
			
			return self;
		},
		
		// bumps element to first place
		bump: function (elem) {
			// removing element from chain
			self.unlink(elem);
			
			// adding back element at start
			self.add(elem);
			
			return self;
		},
		
		//////////////////////////////
		// Iteration

		// processes next element in queue
		// - finish: function to call when handler finishes
		next: function (finish) {
			// removing first link (shifting)
			var elem = first.load;
			self.unlink(elem);
			
			// running handler on load
			return handler(elem, finish);
		},
		
		// starts processing chain
		// - async: whether the handler (user supplied function) is asynchronous
		//   if so, handler must call 'finish(retval)' when finished
		start: function (async) {
			stopped = false;
			var result = [],
					next;
			
			function finish(retval) {
				result.push(retval);
				onProgress(retval);
				if (first !== null && !stopped) {
					next();
				} else {
					onFinished(result);
				}
			}
			
			next = function () {
				if (async) {
					self.next(finish);		// CPS
				} else {
					finish(self.next());	// normal
				}
			};
			
			next();
			
			return self;
		},
		
		// stops processing chain
		stop: function () {
			stopped = true;
			
			return self;
		},
		
		//////////////////////////////
		// Getters

		// retrieves first link
		first: function () {
			return first;
		},
		
		// retrieves a link for a given element
		lookup: function (elem) {
			return lookup[elem];
		},
		
		// returns the chain load as an array
		// in the current order
		order: function () {
			var tmp = first,
					result = [];
			while (tmp !== null) {
				result.push(tmp.load);
				tmp = tmp.next;
			}
			return result;
		},
		
		// retrieves current chain length
		length: function () {
			return length;
		},
		
		//////////////////////////////
		// Event setters

		onFinished: function (value) {
			onFinished = value;
			return self;
		},
		
		onProgress: function (value) {
			onProgress = value;
			return self;
		}
	};
	
	return self;
};

exports.chain = chain;

