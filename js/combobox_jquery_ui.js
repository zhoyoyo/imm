/*
 * Combobox for jQuery UI
 *
 * Adapted from an example. See
 * http://jqueryui.com/autocomplete/#combobox
 *
 * Useage: 
 *
 * First, write some HTML...
 * <select id="combobox">
 *   <option value="">Select one...</option>
 *   <option value="ActionScript">ActionScript</option>
 *   .
 *   .
 *   .
 * </select>
 *
 * Then initialize... 
 * $( "#combobox" ).combobox();
 *
 */
(function( $ ) {
	$.widget( "custom.combobox", {
	  _create: function() {
	    this.wrapper = $( "<span>" )
	      .addClass( "custom-combobox" )
	      .insertAfter( this.element );

	    this.element.hide();
	    this._createAutocomplete();
	    this._createShowAllButton();
	  },

	  _createAutocomplete: function() {
	    var selected = this.element.children( ":selected" ),
	      value = selected.val() ? selected.text() : "",
	      onSelect = this.options.onSelect || function () { /* noop */ };

	    this.input = $( "<input>" )
	      .appendTo( this.wrapper )
	      .val('')
	      .attr({
      			"title": "",
      			"placeholder": value
		  	})
	      .addClass( "custom-combobox-input ui-widget ui-widget-content ui-state-default ui-corner-left" )
	      .autocomplete({
	        delay: 0,
	        minLength: 0,
	        source: $.proxy( this, "_source" )
	      })
	      .tooltip({
	        tooltipClass: "ui-state-highlight"
	      });

        // Trying to suppress Enter button triggering submission
	    this.input.on('keydown', function (e) {
	      	var code = (e.keyCode ? e.keyCode : e.which);
		
		    if(code == 13) { //Enter keycode
		        return false;
		    }
      	});

	    this._on( this.input, {
	      autocompleteselect: function( event, ui ) {
	        ui.item.option.selected = true;
	        onSelect(ui.item.option.value)
	        this._trigger( "select", event, {
	          item: ui.item.option
	        });

	        // Clear out input once selection made
	        $('.custom-combobox-input').val('');
	      },

	      autocompletechange: "_removeIfInvalid"
	    });
	  },

	  _createShowAllButton: function() {
	    var input = this.input,
	      wasOpen = false;

	    $( "<a>" )
	      .attr( "tabIndex", -1 )
	      .attr( "title", "Show All Items" )
	      .tooltip()
	      .appendTo( this.wrapper )
	      .button({
	        icons: {
	          primary: "ui-icon-triangle-1-s"
	        },
	        text: false
	      })
	      .removeClass( "ui-corner-all" )
	      .addClass( "custom-combobox-toggle ui-corner-right" )
	      .mousedown(function() {
	        wasOpen = input.autocomplete( "widget" ).is( ":visible" );
	      })
	      .click(function() {
	        input.focus();

	        // Close if already visible
	        if ( wasOpen ) {
	          return;
	        }

	        // Pass empty string as value to search for, displaying all results
	        input.autocomplete( "search", "" );
	      });
	  },

	  _source: function( request, response ) {
	    var matcher = new RegExp( $.ui.autocomplete.escapeRegex(request.term), "i" );
	    response( this.element.children( "option" ).map(function() {
	      var text = $( this ).text();
	      if ( this.value && ( !request.term || matcher.test(text) ) )
	        return {
	          label: text,
	          value: text,
	          option: this
	        };
	    }) );
	  },

	  _removeIfInvalid: function( event, ui ) {

	    // Selected an item, nothing to do
	    if ( ui.item ) {
	      return;
	    }

	    // Search for a match (case-insensitive)
	    var value = this.input.val(),
	      valueLowerCase = value.toLowerCase(),
	      valid = false;
	    this.element.children( "option" ).each(function() {
	      if ( $( this ).text().toLowerCase() === valueLowerCase ) {
	        this.selected = valid = true;
	        return false;
	      }
	    });

	    // Found a match, nothing to do
	    if ( valid ) {
	      return;
	    }

	    // Remove invalid value
	    this.input
	      .val( "" )
	      .attr( "title", value + " didn't match any item" )
	      .tooltip( "open" );
	    this.element.val( "" );
	    this._delay(function() {
	      this.input.tooltip( "close" ).attr( "title", "" );
	    }, 2500 );
	    this.input.data( "ui-autocomplete" ).term = "";
	  },

	  _destroy: function() {
	    this.wrapper.remove();
	    this.element.show();
	  }
	});
})( jQuery );