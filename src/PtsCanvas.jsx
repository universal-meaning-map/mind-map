import React from 'react';

// For ES5 builds, import from 'pts/dist/es5'. For ES6 or custom builds, import from 'pts'.
import { CanvasSpace } from 'pts';
//var Hammer = require('react-hammerjs');
import TapAndPinchable from 'react-tappable/lib/TapAndPinchable';

export default class PtsCanvas extends React.Component {

  constructor(props) {
    super(props);
    this.canvRef = React.createRef();
    this.space = null;
    this.form = null;
    this.pressingTimeout = null
    this.state = {
      isPressing: false,
      isLongPress: false,
      touchStartTimestamp: 0,
      pressStartPointer: null,
    }

    document.addEventListener('visibilitychange', this.onVisibilityChange.bind(this));

  }

  componentDidMount() {
    this._create();
    this._loop();
  }

  componentDidUpdate() {
    this._loop();
  }

  onVisibilityChange(e, a) {
    if (document.visibilityState == 'visible')
      this.space.resume()
    else
      this.space.pause()
  }

  _loop() {
    if (this.props.loop) {
      this.space.play();
    } else {
      this.space.playOnce(0);
    }
  }

  // Required: Override this to use Pts' player `animate` callback
  // See guide: https://ptsjs.org/guide/space-0500
  animate(time, ftime) { }

  // Optional: Override this to use Pts' player `start` callback
  start(space, bound) { }


  // Optional: Override this to use Pts' player `resize` callback
  resize(size, evt) { }


  // Optional: Override this to use Pts' player `action` callback
  action(type, px, py, evt) { }


  _create() {
    this.space = new CanvasSpace(this.canvRef, this.onCanvasReady).setup({
      bgcolor: this.props.background,
      resize: true,
      retina: true
    });

    this.form = this.space.getForm();
    this.space.add(this);
    this.space.bindMouse().bindTouch();
    this.onPressTimeReached = this.onPressTimeReached.bind(this)
  }

  onCanvasReady() {
    //overwritten by sub class
  }

  onPinchStart(e) {
    if (this.props.onPinchStart)
      this.props.onPinchStart(e)
  }

  onPinchMove(e) {
    if (this.props.onPinchMove)
      this.props.onPinchMove(e)
  }

  onPinchEnd(e) {
    if (this.props.onPinchEnd)
      this.props.onPinchEnd(e)
  }

  onTouchStart(e) {
    if (this.pressingTimeout)
      clearTimeout(this.pressingTimeout)
    this.pressingTimeout = setTimeout(this.onPressTimeReached, this.props.longPressDelay)
    // this.setState({ touchStartTimestamp: Date.now() })
    if (this.props.onPressStart)
      this.props.onPressStart(this.space.pointer)

    this.setState({ isPressing: true, pressStartPointer: this.space.pointer })
  }

  onPressTimeReached() {
    if (!this.state.isPressing)
      return
    let distanceMoved = Math.abs(this.space.pointer.$subtract(this.state.pressStartPointer).magnitude())

    if (distanceMoved < 5)
      this.onLongPressStart()
  }

  onLongPressStart() {
    if (this.props.onLongPressStart)
      this.props.onLongPressStart(this.space.pointer)
    this.setState({ isLongPress: true })
  }

  onTouchEnd(e) {
    if (this.props.onPressEnd)
      this.props.onPressEnd(this.space.pointer)

    if (this.state.isLongPress) {
      if (this.props.onLongPressEnd)
        this.props.onLongPressEnd()
    }
    this.setState({ isPressing: false, isLongPress: false })
  }

  render() {
    return (

      <TapAndPinchable
        style={{ touchAction: 'none' }}
        stopPropagation={true}
        preventDefault={true}
        onPinchMove={this.onPinchMove.bind(this)}
        onPinchStart={this.onPinchStart.bind(this)}
        onPinchEnd={this.onPinchEnd.bind(this)}
        onTouchStart={this.onTouchStart.bind(this)}
        onTouchEnd={this.onTouchEnd.bind(this)}
        onMouseDown={this.onTouchStart.bind(this)}
        onMouseUp={this.onTouchEnd.bind(this)}
      //onPress={this.onPress.bind(this).bind('contextmenu', function (e) { return false })}
      //pressDelay={this.props.pressDelay}
      >

        <div className={this.props.name || ""}>
          <canvas
            height={800}
            onContextMenu={(e) => { e.preventDefault() }}
            ref={c => (this.canvRef = c)}></canvas>
        </div>
      </TapAndPinchable>

    );
  }
}


PtsCanvas.defaultProps = {
  name: "pt", // maps to className of the container div
  background: "#ff0",
  resize: true,
  retina: true,
  loop: true
}