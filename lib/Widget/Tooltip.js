if( typeof( Widget ) == 'undefined' ) { Widget = {}; }

// class constructor
Widget.Tooltip = function( oProps )
{
    // class properties
    this.props = {};

    // defaults
    this.props.elementId = null; // mandatory!
    this.props.enableLock = 1;
    this.props.enableMove = 1;
    this.props.offsetX = 16;
    this.props.offsetY = 16;
    this.props.tooltipClass = 'tooltip';
    this.props.tooltipContent = 'Emtpy tooltip!';
    this.props.fadeOut = 0;

    // overwrite properties with user defined ones
    for( var cProp in this.props )
    {
        if( oProps[cProp] != undefined )
        {
            this.props[cProp] = oProps[cProp];
        }
    }

    // elementId must exists in DOM!
    if( ! this.props.elementId || ! document.getElementById( this.props.elementId ) )
    {
        return undefined;
    }

    // DOM stuff
    this.dom = {};

    // lock flag
    this.lock = 0;

    this._init();
}

// version
Widget.Tooltip.VERSION = '0.02';

// class methods
Widget.Tooltip.prototype = {

// _init: attach the event handlers to the specified DOM element
_init: function()
{
    var oWT = this;

    // element object
    var oElement = document.getElementById( this.props.elementId );

    this.dom.elementEl = oElement;

    // mouse over on the element will show the tooltip
    this._addEvent(
        oElement,
        'mouseover',
        function( e ) { oWT.show( e ); }
    );

    // mouse out on the element will hide the tooltip
    this._addEvent(
        oElement,
        'mouseout',
        function() { oWT.hide(); }
    );

    if( this.props.enableMove )
    {
        // mouse move on the element will move the tooltip
        this._addEvent(
            oElement,
            'mousemove',
            function( e ) { oWT.move( e ); }
        );
    }

    if( this.props.enableLock )
    {
        // click on the element will freeze/unfreeze the tooltip
        this._addEvent(
            oElement,
            'click',
            function( e ) { oWT.toggleLock( e ); }
        );
    }
},

// show: build the div and show it
show: function( e )
{
    if( this.lock ) { return true; }

    if( ! e && window.event )
    {
        e = window.event;
    }

    var oTooltip = document.createElement( 'div' );

    // assign properties
    oTooltip.className = this.props.tooltipClass;
    oTooltip.innerHTML = this.props.tooltipContent;

    this.dom.tooltipEl = oTooltip;

    // page scroll offset
    var aScroll = this._getScrollOffset();

    // initial position
    with( oTooltip.style )
    {
        visibility = 'hidden';
        position = 'absolute';
        top = e.clientY + this.props.offsetY + aScroll['y'];
        left = e.clientX + this.props.offsetX + aScroll['x'];
    }
    
    document.body.appendChild( oTooltip );

    oTooltip.style.visibility = 'visible';

    // start the fade timer
    if( this.props.fadeOut > 0 )
    {
        var oWT = this;
        setTimeout( function() { oWT.hide(); }, this.props.fadeOut );
    }
},

// move: make the tooltip follow the mouse pointer
move: function( e )
{
    var oTooltip = this.dom.tooltipEl;

    if( oTooltip === undefined ) { return true; }

    if( this.lock ) { return true; }

    if( ! e && window.event )
    {
        e = window.event;
    }

    // page scroll offset
    var aScroll = this._getScrollOffset();

    oTooltip.style.top = e.clientY + this.props.offsetY + aScroll['y'];
    oTooltip.style.left = e.clientX + this.props.offsetX + aScroll['x'];
},

// hide: hide the tooltip
hide: function()
{
    if( this.lock ) { return true; }

    var oTooltip = this.dom.tooltipEl;

    if( oTooltip )
    {
        oTooltip.style.visibility = 'hidden';

        document.body.removeChild( oTooltip );

        this.dom.tooltipEl = undefined;
    }
},

// toggleLock: switch the internal lock flag
toggleLock: function( e )
{
    this.lock = ! this.lock;

    // FIXME understand better how this should work!
    if( window.event )
    {
        if( ! e ) { e = window.event };

        e.cancelBubble = true;
        e.returnValue = false;
    }
    else
    {
        e.cancelBubble = true;
        e.returnValue = false;
        e.preventDefault();
        e.stopPropagation();
    }
},

// _addEvent: cross-browser event handler
_addEvent: function( oObj, cEvent, rFunction )
{
    if( oObj.addEventListener )
    {
        oObj.addEventListener( cEvent, rFunction, false );
        return true;
    }
    else if( oObj.attachEvent )
    {
        return oObj.attachEvent( 'on' + cEvent, rFunction );
    }
    else
    {
        return false;
    }
},

// get the page scroll offset (see http://www.quirksmode.org/viewport/compatibility.html#link3)
_getScrollOffset: function()
{
    var nXOffset = 0; var nYOffset = 0;

    if( window.pageYOffset )
    {
        nXOffset = window.pageXOffset;
        nYOffset = window.pageYOffset;
    }
    else if( document.documentElement && document.documentElement.scrollTop )
    {
        nXOffset = document.documentElement.scrollLeft;
        nYOffset = document.documentElement.scrollTop;
    }
    else if( document.body )
    {
        nXOffset = document.body.scrollLeft;
        nYOffset = document.body.scrollTop;
    }

    return { x: nXOffset, y: nYOffset };
}

};

/*

=head1 NAME

Widget.Tooltip - Unobtrusive javascript class for create and handle tooltips

=head1 SYNOPSIS

 <!-- XHTML page -->
 <p id="text1">some text...</p>

 // javascript code
 new Widget.Tooltip({ elementId: 'text1', tooltipContent: 'tooltip for some text' });

=head1 DESCRIPTION

This nice class implements some methods for adding tooltips on document elements.
The tooltip can contain plain text or some XHTML markup.
When the user moves the mouse over the reference element, the tooltip is shown.
By setting some configurable options is possible to control the tooltip behaviour, by default the tooltip follows the mouse when is moved, stops and freezes on a left button click, another click will unlock the tooltip.

Tested under Firefox 2, Internet Explorer 6/7, Opera 9.

=head1 METHODS

=head2 B<new()>

Class constructor. If the DOM element specified in the C<elementId> property exists, returns a new Widget.Tooltip object, otherwise returns the C<undefined> value.

=head3 Parameters

=over 3

=item B<oProps>

Object literal where must be specified the element id on which add the tooltip, the tooltip content and other optional properties that overwrites the defaults.

Properties are:

=over 3

=item C<elementId>

ID of the element on which add a tooltip. B<mandatory!>

=item C<enableLock>

Defines if the tooltip must freeze on the current mouse position by clicking the reference element (default is 1=enabled, set to 0 to disable).

=item C<enableMove>

Defines if the tooltip must follow the mouse pointer when is moved (default is 1=enabled, set to 0 to disable).

=item C<fadeOut>

Time expressed in milliseconds after which the tooltip will be hidden (default 0=disabled).

=item C<offsetX>

Horizontal distance in pixels from the mouse pointer of the tooltip top-left corner (default is 16).

=item C<offsetY>

Vertical distance in pixels from the mouse pointer of the tooltip top-left corner (default is 16).

=item C<tooltipClass>

CSS class to assign to the tooltip div element (default is `tooltip'), useful for adding some make-up to the tooltip.

=item C<tooltipContent>

Content of the tooltip. Usually some text you want to show. You can pass also an XHTML string. If nothing is provided, the default text `Empty tooltip!' is used.

=back

=back

=head2 B<hide()>

Hides the tooltip.

=head2 B<move()>

Moves the tooltip following the mouse pointer (depending on the enableMove flag setting).

=head2 B<show()>

Shows the tooltip.

=head2 B<toggleLock()>

Freezes/unfreezes the tooltip by switching the internal lock flag (depending on the enableLock flag setting).

=head1 EXAMPLES

 <!-- you can initialize the class within your XHTML page like this -->
  <p id="text1">some text...</p>
  <p>an image<br />
  <img src="ghost.png" /></p>
  <p>you can also have a <a id="anchor1" href="somewhere_else">link</a> within the text on which you want to add a tooltip.</p>

  <script type="text/javascript">
   new Widget.Tooltip({ elementId: 'text1', tooltipContent: 'tooltip for some text (fades out in 5 seconds)', fadeout: 5000 });
   new Widget.Tooltip({ elementId: 'img1', tooltipContent: 'where is the image?!<br />click <a href="#" onclick="showImage(\'img1\')">here</a>...' });
   new Widget.Tooltip({ elementId: 'anchor1', tooltipContent: 'a link must be clickable, so you should set enableLock to 0 on this tooltip!', enableLock: 0 });
  </script>

 // or in a more unobtrusive way put the new in an included javascript file.
 // be sure to call the new when the page is loaded!
 // a cross-browser way may be this
 if( document.addEventListener )
 {
     document.addEventListener(
       'load',
       function() {
           new Widget.Tooltip({ elementId: 'text1', tooltipContent: 'tooltip for some text (fades out in 5 seconds)', fadeout: 5000 });
           new Widget.Tooltip({ elementId: 'img1', tooltipContent: 'where is the image?!<br />click <a href="#" onclick="showImage(\'img1\')">here</a>...' });
           new Widget.Tooltip({ elementId: 'anchor1', tooltipContent: 'a link must be clickable, so you should set enableLock to 0 on this tooltip!', enableLock: 0 });
       },
       false
     );

     return true;
 }
 else if( document.attachEvent )
 {
     return document.attachEvent(
       'onload',
       function() {
           new Widget.Tooltip({ elementId: 'text1', tooltipContent: 'tooltip for some text (fades out in 5 seconds)', fadeout: 5000 });
           new Widget.Tooltip({ elementId: 'img1', tooltipContent: 'where is the image?!<br />click <a href="#" onclick="showImage(\'img1\')">here</a>...' });
           new Widget.Tooltip({ elementId: 'anchor1', tooltipContent: 'a link must be clickable, so you should set enableLock to 0 on this tooltip!', enableLock: 0 });
       }
     );
 }

=head1 SEE ALSO

Official web page at L<http://www.sabadelli.it/edoardo/projects/javascript/widget.tooltip>

JSAN L<http://openjsan.org/>

=head1 AUTHOR

Edoardo Sabadelli - L<http://www.sabadelli.it/edoardo>

=head1 COPYRIGHT

Copyright (c) 2007 Edoardo Sabadelli. All rights reserved.

This module is free software; you can redistribute it and/or modify it
under the terms of the Artistic license.

=cut

*/
