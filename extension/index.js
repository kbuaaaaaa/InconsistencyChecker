/*Actions to be performed on the page that you want to operate on

 */
//The original size wide
var width = 100;
//The original size of high
var height = 100;
//Non-compliant size DOM element
var unqualifiedTarget = [];

//Gets the class DOM element
function getDomByClass(name) {
  return document.getElementsByClassName(name);
}

//Set the non-compliant size DOM element (set the color)
function setDomColor() {
  for (var i = 0; i < unqualifiedTarget.length; i++) {
    var targetDom = unqualifiedTarget[i];
    targetDom.style.background = 'red';
  }
  alert('Mark the DOM element of non-compliant size in red, click ok for 5 seconds and return to original!')
  setTimeout('delDomColor()', 5000 );
}

//Set the DOM element of non-compliant size (uncolor)
function delDomColor() {
  for (var i = 0; i < unqualifiedTarget.length; i++) {
    var targetDom = unqualifiedTarget[i];
    targetDom.style.background = '';
  }
  unqualifiedTarget=[];
}

//Judge noncompliant dimensions
function contrastDomSzie(target,contrastWidth,contrastHeight){
  if(target&&target.length > 0){
    for (var i = 0; i < target.length; i++) {

      var targetDom = target[i];
      var backgroundPosition = window.getComputedStyle(targetDom,null).getPropertyValue('background-position');

      if(backgroundPosition != null && backgroundPosition != undefined ){
        if (contrastWidth != targetDom.clientWidth || contrastHeight != targetDom.clientHeight) {
          console.log('index['+i+'],Fail!'+targetDom);
          unqualifiedTarget[unqualifiedTarget.length] = targetDom;
        }
      }
    }
  }
}

//manner of execution
contrastDomSzie(getDomByClass('nav-sprite'),width,height);
contrastDomSzie(getDomByClass('nav-icon'),width,height);
setDomColor();