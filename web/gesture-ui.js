
//single-pdf-style로 실행 viewer.js
const viewer = document.getElementById('viewerContainer');
const swipeHorizontalButton = document.getElementById('swipeHorizontalMode');
const swipeVerticalButton = document.getElementById('swipeVerticalMode');
const pageControlButton = document.querySelector('.pageCtrlBtn');
const scaleSelect = document.getElementById('scaleSelect');
let isTouchDirection = 'swipeHorizontal';

//스와이프 모드선택 - 기본 가로스와이프
swipeHorizontalButton.addEventListener('click',changeSwipeMode);
swipeVerticalButton.addEventListener('click',changeSwipeMode);


function changeSwipeMode(e){
    if(e.target.classList.contains(isTouchDirection)) return;

    if(isTouchDirection === 'swipeHorizontal'){
        isTouchDirection = 'swipeVertical';
        swipeVerticalButton.classList.add('actived');
        swipeHorizontalButton.classList.remove('actived');
        pageControlButton.classList.add('hidden');
    }else{
        isTouchDirection = 'swipeHorizontal';
        swipeHorizontalButton.classList.add('actived');
        swipeVerticalButton.classList.remove('actived');
        pageControlButton.classList.remove('hidden')
    }
}

const hammertime = new Hammer(viewer, {touchAction : 'none'});
hammertime.add(new Hammer.Pan({
    threshold : 0,
    pointer : 0
}));

hammertime.add(new Hammer.Swipe()).recognizeWith(hammertime.get('pan'));
hammertime.add(new Hammer.Pinch({ threshold: 0 })).recognizeWith(hammertime.get('pan'));
hammertime.on('swipe', onSwipe);
hammertime.on('pinchstart pinchmove pinchend', onPinch);

function onSwipe(ev){
    //화면 크기보다 확대 된 경우, swipe중지
    const isScaleOver = document.querySelector('.page').clientWidth > viewer.clientWidth;
    if (isScaleOver) return;
    //swipeLeft, swipeDown 시 다음페이지, swipeRigth, swipeUp 시 이전페이지
    let direction = {};
    if(isTouchDirection === 'swipeHorizontal'){
        direction = {next : 2, prev : 4}
    }else{
        direction = {next : 8, prev : 16} 
    }

    if (ev.offsetDirection === direction.next) {
        PDFViewerApplication.pdfViewer.nextPage();
    } else if (ev.offsetDirection === direction.prev) {
        PDFViewerApplication.pdfViewer.previousPage();
    }
}


let timer;
function onPinch(ev){
    const {pdfViewer} = PDFViewerApplication;
    const MIN_SCALE = 0.4;
    const MAX_SCALE = 4;
    const initScale = pdfViewer.currentScale;
    if(ev.type === 'pinchstart'){
        viewer.style.touchAction = 'none';
    }
    if(ev.type === 'pinchmove'){
        if(timer) {
            clearTimeout(timer);
        }
        timer = setTimeout(function(){
            const scale = ev.scale.toFixed();
            if(ev.additionalEvent === 'pinchout'){
                pdfViewer.currentScaleValue = Math.min(initScale + (scale * 0.01), MAX_SCALE).toFixed(2);
            }else if(ev.additionalEvent === 'pinchin'){
                pdfViewer.currentScaleValue = Math.max(initScale - (scale * 0.1), MIN_SCALE).toFixed(2);
            }
            if(initScale !== pdfViewer.currentScale){
                const scaleCorrectionFactor = (pdfViewer.currentScale / initScale) - 1;
                
                const dx = ev.center.x * scaleCorrectionFactor;
                const dy = ev.center.y * scaleCorrectionFactor;
            
                pdfViewer.container.scrollLeft += dx;
                pdfViewer.container.scrollTop += dy;

            }
        },10)
    }

    if(ev.type === 'pinchend'){
        //touchAction변경
        checktouchAction();
    }
}

function checktouchAction(){
    const page = document.querySelector('.page');
    let condition;
    //모드확인 
    if(window.matchMedia('(orientation: portrait)').matches){ //세로모드
        condition = page.offsetWidth > viewer.offsetWidth;
    }else{
        condition = page.offsetHeight > viewer.offsetHeight;
    }
    if(condition){
        viewer.style.touchAction = 'pan-x pan-y';
    }else{
        viewer.style.touchAction = 'none';
    }
}

//select박스로 비율 조정 시 터치액션 조정
scaleSelect.addEventListener('change',checktouchAction);

//resize시 터치액션조정 
window.addEventListener('resize', checktouchAction);
