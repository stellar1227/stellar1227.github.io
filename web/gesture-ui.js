//single-pdf-style로 실행 viewer.js
const viewer = document.getElementById('viewerContainer');
const pages = document.getElementById('.viewer')

const hammertime = new Hammer(viewer, {touchAction : 'pan-y'});

hammertime.add(new Hammer.Pan({
    threshold : 0,
    pointer : 0
}));

hammertime.add(new Hammer.Swipe()).recognizeWith(hammertime.get('pan'));
hammertime.add(new Hammer.Pinch({ threshold: 0 })).recognizeWith(hammertime.get('pan'));

hammertime.on('swipe', onSwipe);
hammertime.on('pinchstart pinchmove pinchend', onPinch);



function touchActionChange(){
    //화면 크기보다 확대 된 경우, touchAction pan-x, pan-y 교체
    const isScaleOver = document.querySelector('.page').clientWidth > viewer.clientWidth;
    if (isScaleOver){
        viewer.style.touchAction = 'pan-x pan-y'
    }else{
        viewer.style.touchAction = 'pan-y'
    }
}

function onSwipe(ev){
    //화면 크기보다 확대 된 경우, swipe중지
    const isScaleOver = document.querySelector('.page').clientWidth > viewer.clientWidth;
    if (isScaleOver) return;

    //swipeLeft, swipeDown 시 다음페이지, swipeRigth, swipeUp 시 이전페이지
    const direction = (ev.offsetDirection === 2 || ev.offsetDirection === 8) ? 'next' : 'previous'; 

    if (direction === 'next') {
        PDFViewerApplication.pdfViewer.nextPage();
    } else {
        PDFViewerApplication.pdfViewer.previousPage();
    } 
}

function onPinch(ev){
    const {pdfViewer} = PDFViewerApplication;
    const initScale = pdfViewer.currentScale;
    const MIN_SCALE = 0.4;
    const MAX_SCALE = 4;
    // console.log(page)
    if(ev.type === 'pinchmove'){
        if(ev.additionalEvent === 'pinchout'){
            pdfViewer.currentScaleValue = Math.min(initScale + (ev.scale * 0.01), MAX_SCALE)
        }else if(ev.additionalEvent === 'pinchin'){
            pdfViewer.currentScaleValue = Math.max(initScale - (ev.scale * 0.1), MIN_SCALE)
        }

        const currentScale = pdfViewer.currentScale;

        if (initScale !== currentScale) {
            const scaleCorrectionFactor = currentScale / initScale - 1;
            const page = document.querySelector('.page');
            const screen = pdfViewer.container;
            

            const dx = ev.center.x  - page.offsetLeft;
            const dy = ev.center.y - page.offsetTop;
            
            pdfViewer.container.scrollLeft += dx * scaleCorrectionFactor;
            pdfViewer.container.scrollTop += dy * scaleCorrectionFactor;
            
            touchActionChange();
        }
    }
}

