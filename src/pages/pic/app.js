// app.js
class ImageViewer {
    constructor() {
        this.currentScale = 1;
        this.translateX = 0;
        this.translateY = 0;
        this.isDragging = false;
        this.startX = 0;
        this.startY = 0;
        this.initialTranslateX = 0;
        this.initialTranslateY = 0;
        this.currentIndex = 0;
        this.currentCategory = null;
        
        this.lightbox = document.getElementById('lightbox');
        this.lightboxImg = document.getElementById('lightbox-img');
        
        this.initEventListeners();
    }

    initEventListeners() {
        // 图片点击事件
        document.querySelectorAll('.category').forEach(category => {
            const products = category.querySelectorAll('.product img');
            products.forEach((product, index) => {
                product.addEventListener('click', () => this.openLightbox(product, category, index));
            });
        });

        // 灯箱控制
        this.lightbox.querySelector('.close').addEventListener('click', () => this.closeLightbox());
        this.lightbox.querySelector('.prev').addEventListener('click', () => this.changeImage(-1));
        this.lightbox.querySelector('.next').addEventListener('click', () => this.changeImage(1));
        this.lightbox.querySelector('.zoom-in').addEventListener('click', () => this.zoomImage(1.2));
        this.lightbox.querySelector('.zoom-out').addEventListener('click', () => this.zoomImage(0.8));

        // 拖拽事件
        this.lightboxImg.addEventListener('mousedown', e => this.startDragging(e));
        document.addEventListener('mousemove', e => this.drag(e));
        document.addEventListener('mouseup', () => this.stopDragging());

        // 滚轮缩放
        this.lightbox.addEventListener('wheel', e => this.handleWheel(e), { passive: false });
    }

    openLightbox(imgElement, category, index) {
        this.currentCategory = category;
        this.currentIndex = index;
        this.lightboxImg.src = imgElement.src;
        this.lightbox.classList.add('active');
        this.resetZoom();
        this.updateNavigation();
    }

    updateNavigation() {
        const products = this.currentCategory.querySelectorAll('.product img');
        this.lightbox.querySelector('.prev').style.display = products.length > 1 ? 'block' : 'none';
        this.lightbox.querySelector('.next').style.display = products.length > 1 ? 'block' : 'none';
    }

    changeImage(direction) {
        const products = this.currentCategory.querySelectorAll('.product img');
        this.currentIndex = (this.currentIndex + direction + products.length) % products.length;
        this.lightboxImg.src = products[this.currentIndex].src;
        this.resetZoom();
    }

    resetZoom() {
        this.currentScale = 1;
        this.translateX = 0;
        this.translateY = 0;
        this.updateTransform();
    }

    zoomImage(factor) {
        const rect = this.lightbox.getBoundingClientRect();
        this.handleZoom(factor, rect.left + rect.width/2, rect.top + rect.height/2);
    }

    handleZoom(factor, clientX, clientY) {
        const newScale = this.currentScale * factor;
        if (newScale < 0.5 || newScale > 4) return;

        const rect = this.lightbox.getBoundingClientRect();
        const offsetX = clientX - rect.left - this.lightbox.clientWidth / 2;
        const offsetY = clientY - rect.top - this.lightbox.clientHeight / 2;

        this.translateX = offsetX * (1 - factor) + this.translateX * factor;
        this.translateY = offsetY * (1 - factor) + this.translateY * factor;
        this.currentScale = newScale;

        this.enforceBounds();
        this.updateTransform();
    }

    enforceBounds() {
        const viewWidth = this.lightbox.clientWidth;
        const viewHeight = this.lightbox.clientHeight;
        const imgWidth = this.lightboxImg.naturalWidth * this.currentScale;
        const imgHeight = this.lightboxImg.naturalHeight * this.currentScale;

        // 限制平移范围
        const maxX = Math.max((imgWidth - viewWidth) / 2, 0);
        const maxY = Math.max((imgHeight - viewHeight) / 2, 0);

        this.translateX = Math.max(-maxX, Math.min(this.translateX, maxX));
        this.translateY = Math.max(-maxY, Math.min(this.translateY, maxY));
    }

    updateTransform() {
        this.lightboxImg.style.transform = `scale(${this.currentScale}) translate(${this.translateX}px, ${this.translateY}px)`;
    }

    startDragging(e) {
        this.isDragging = true;
        this.startX = e.clientX;
        this.startY = e.clientY;
        this.initialTranslateX = this.translateX;
        this.initialTranslateY = this.translateY;
        e.preventDefault();
    }

    drag(e) {
        if (!this.isDragging) return;
        const deltaX = e.clientX - this.startX;
        const deltaY = e.clientY - this.startY;
        this.translateX = this.initialTranslateX + deltaX;
        this.translateY = this.initialTranslateY + deltaY;
        this.enforceBounds();
        this.updateTransform();
        e.preventDefault();
    }

    stopDragging() {
        this.isDragging = false;
    }

    handleWheel(e) {
        e.preventDefault();
        this.handleZoom(e.deltaY > 0 ? 0.8 : 1.2, e.clientX, e.clientY);
    }

    closeLightbox() {
        this.lightbox.classList.remove('active');
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    new ImageViewer();
});