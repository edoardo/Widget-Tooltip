JSAN.use( 'DOM.Events' );

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
    this.props.tooltipContent = 'Empty tooltip!';
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
Widget.Tooltip.VERSION = '0.03';

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
    DOM.Events.addListener(
        oElement,
        'mouseover',
        function( e ) { oWT.show( e ); }
    );

    // mouse out on the element will hide the tooltip
    DOM.Events.addListener(
        oElement,
        'mouseout',
        function() { oWT.hide(); }
    );

    if( this.props.enableMove )
    {
        // mouse move on the element will move the tooltip
        DOM.Events.addListener(
            oElement,
            'mousemove',
            function( e ) { oWT.move( e ); }
        );
    }

    if( this.props.enableLock )
    {
        // click on the element will freeze/unfreeze the tooltip
        DOM.Events.addListener(
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

    var oTooltip = document.createElement( 'div' );

    // assign properties
    oTooltip.className = this.props.tooltipClass;
    oTooltip.innerHTML = this.props.tooltipContent;

    this.dom.tooltipEl = oTooltip;

    // page scroll offset
    var aScroll = this._getScrollOffset();

    with( oTooltip.style )
    {
        visibility = 'hidden';
        position = 'absolute';
        top = ( e.clientY + this.props.offsetY + aScroll['y'] ) + 'px';
        left = ( e.clientX + this.props.offsetX + aScroll['x'] ) + 'px';
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

    e.preventDefault();

    if( e.stopPropagation )
    {
        e.stopPropagation();
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

*/
