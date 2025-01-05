/*
* LC Waikiki Product Carousel
* Description:
* This code creates a responsive product carousel for LC Waikiki product pages.
* It displays recommended products with favorite functionality and smooth sliding animation.
* 
* Features:
* - Displays 6.5 products on desktop view
* - Responsive design (mobile, tablet, desktop)
* - Smooth sliding animation
* - Favorite functionality with localStorage
* - Product data caching
*/

(() => {
    // Main object for carousel state and functionality
    const self = {
        products: [],
        currentPosition: 0,
        productsPerView: 6.5,
        
        // Loads and manages product data from storage or API
        loadProducts: async function() {
            try {
                const storedProducts = localStorage.getItem('carouselProducts');
                const storedFavorites = JSON.parse(localStorage.getItem('favoriteProducts') || '[]');
                
                if (storedProducts) {
                    this.products = JSON.parse(storedProducts).map(item => ({
                        ...item,
                        price: item.price.replace(', TRY', ' TRY').replace('TL', 'TRY')
                    }));
                } else {
                    const response = await fetch('https://gist.githubusercontent.com/sevindi/5765c5812bbc8238a38b3cf52f233651/raw/56261d81af8561bf0a7cf692fe572f9e1e91f372/products.json');
                    const data = await response.json();
                    
                    this.products = data.map(item => ({
                        id: item.id,
                        name: item.name,
                        price: item.price ? `${parseFloat(item.price).toLocaleString('tr-TR')} TRY` : '0,00 TRY',
                        image: item.image || item.img || item.imageUrl || 'https://via.placeholder.com/300x400?text=No+Image',
                        url: item.productUrl || item.url || `https://www.lcwaikiki.com/tr-TR/TR/urun/${item.id}`,
                        isFavorite: storedFavorites.includes(item.id)
                    }));
                    
                    updateStorage(this.products);
                }

                this.products = updateFavoriteStatus(this.products, storedFavorites);
                updateStorage(this.products, storedFavorites);
                
            } catch (error) {
                console.error('Error loading products:', error);
                this.products = [];
            }
        }
    };

    // Initialize carousel and setup components
    const init = async () => {
        // Only run on product pages
        if (!document.querySelector('.product-detail')) return;
        
        await self.loadProducts();
        buildHTML();
        buildCSS();
        setEvents();
        updateCarousel();
    };


    // Generate carousel HTML structure
    const buildHTML = () => {
        const html = `
            <div class="product-carousel">
                <h2 class="carousel-title">You Might Also Like</h2>
                <div class="carousel-container">
                    <button class="carousel-arrow prev-arrow">&lt;</button>
                    <div class="carousel-wrapper">
                        <div class="carousel-track">
                            ${self.products.map(product => `
                                <div class="carousel-item">
                                    <div class="product-card">
                                        <a href="${product.url}" target="_blank" class="product-link">
                                            <img src="${product.image}" alt="${product.name}" class="product-image">
                                            <h3 class="product-name">${product.name}</h3>
                                            <p class="product-price">${product.price}</p>
                                        </a>
                                        <button class="favorite-btn ${product.isFavorite ? 'active' : ''}" data-id="${product.id}">
                                            ♡
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <button class="carousel-arrow next-arrow">&gt;</button>
                </div>
            </div>
        `;

        $('.product-detail').append(html);
    };

    // Apply styles to carousel elements
    const buildCSS = () => {
        const css = `
            .product-carousel {
                max-width: 100%;
                margin: 0 auto;
                padding: 0 15px;
            }
            .carousel-title {
                font-size: 32px;
                margin: 20px 0 35px 45px;
                text-align: left;
                font-weight: 300;
                color: #333;
                font-family: Arial, sans-serif;
            }

            .carousel-container {
                position: relative;
                display: flex;
                align-items: center;
            }

            .carousel-wrapper {
                overflow: hidden;
                position: relative;
                width: 100%;
            }
            .carousel-track {
                display: flex;
                transition: transform 0.3s ease;
            }

            .carousel-item {
                flex: 0 0 calc(100% / 6.5);
                padding: 0 10px;
            }
            .product-card {
                position: relative;
                border: 1px solid #eee;
                border-radius: 8px;
                padding: 10px;
                text-align: center;
                height: 100%;
                display: flex;
                flex-direction: column;
            }

            .product-link {
                display: flex;
                flex-direction: column;
                height: 100%;
                text-decoration: none;
            }

            .product-link:hover {
                text-decoration: none;
            }

            .product-image {
                width: 100%;
                height: auto;
                border-radius: 4px;
                margin-bottom: 10px;
            }

            .product-info {
                display: flex;
                flex-direction: column;
                flex: 1;
            }

            .product-name {
                font-size: 14px;
                color: #333;
                margin: 0;
                flex: 1;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
                text-overflow: ellipsis;
                line-height: 1.2;
            }

            .product-price {
                font-size: 16px;
                font-weight: bold;
                color: #000;
                margin: 8px 0 0;
                padding-top: 8px;
            }

            .carousel-arrow {
                background: white;
                border: 2px solid #ddd;
                border-radius: 50%;
                width: 40px;
                height: 40px;

                cursor: pointer;
                z-index: 1;
                position: absolute;
                font-size: 20px;
                font-weight: bold;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
                color: #666;
            }

            .carousel-arrow:hover {
                background: #f8f8f8;
                border-color: #999;
                color: #333;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }

            .prev-arrow {
                left: -20px;
            }
            .next-arrow {
                right: -20px;
            }
            .favorite-btn {
                position: absolute;
                top: 15px;
                right: 15px;
                background: white;
                border: 1px solid #ddd;
                border-radius: 8px;
                width: 35px;
                height: 35px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                z-index: 1;
                text-decoration: none;
                user-select: none;
                font-size: 24px;
                color: #ddd;
                line-height: 1;
                padding-bottom: 2px;
            }

            .favorite-btn:hover {
                transform: scale(1.1);
                box-shadow: 0 3px 7px rgba(0,0,0,0.15);
                color: #999;
            }
            .favorite-btn.active {
                color: #0066cc;
                content: '♥';
            }
            .favorite-btn.active::before {
                content: '♥';
                position: absolute;
                color: #0066cc;
            }
            .favorite-btn::before {
                content: '♥';
                position: absolute;
                color: transparent;
                transition: color 0.3s ease;
            }

            .favorite-btn:hover::before {
                color: rgba(0, 102, 204, 0.3);
            }

            @media (max-width: 1200px) {
                .carousel-item {
                    flex: 0 0 calc(100% / 4.5);
                }
            }

            @media (max-width: 768px) {
                .carousel-item {
                    flex: 0 0 calc(100% / 2.5);
                }
            }

            @media (max-width: 480px) {
                .carousel-item {
                    flex: 0 0 calc(100% / 1.5);
                }
            }
        `;
        $('<style>').addClass('carousel-style').html(css).appendTo('head');
    };

    // Setup event handlers for carousel interactions
    const setEvents = () => {
        $('.next-arrow').on('click', () => {
            if (self.currentPosition > -(self.products.length - self.productsPerView)) {
                self.currentPosition--;
                updateCarousel();
            }
        });
        $('.prev-arrow').on('click', () => {
            if (self.currentPosition < 0) {
                self.currentPosition++;
                updateCarousel();
            }
        });
        $('.favorite-btn').on('click', function(e) {
            e.preventDefault();
            const productId = $(this).data('id');
            const favorites = JSON.parse(localStorage.getItem('favoriteProducts') || '[]');
            
            if ($(this).hasClass('active')) {
                const index = favorites.indexOf(productId);
                if (index > -1) {
                    favorites.splice(index, 1);
                    $(this).removeClass('active');
                }
            } else {
                favorites.push(productId);
                $(this).addClass('active');
            }
            
            // Helper fonksiyonları kullanalım
            self.products = updateFavoriteStatus(self.products, favorites);
            updateStorage(self.products, favorites);
        });
    };
    // Update carousel position for sliding
    const updateCarousel = () => {
        const itemWidth = 100 / self.productsPerView;
        $('.carousel-track').css('transform', `translateX(${self.currentPosition * itemWidth}%)`);
    };

    // Load jQuery library if not present
    const loadJQuery = (callback) => {
        if (typeof jQuery === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://code.jquery.com/jquery-3.6.0.min.js';
            script.onload = callback;
            document.head.appendChild(script);
        } else {
            callback();
        }
    };
    // Update localStorage with current data
    const updateStorage = (products, favorites) => {
        localStorage.setItem('carouselProducts', JSON.stringify(products));
        if (favorites) {
            localStorage.setItem('favoriteProducts', JSON.stringify(favorites));
        }
    };


    // Update favorite status of products
    const updateFavoriteStatus = (products, favorites) => {
        return products.map(product => ({
            ...product,
            isFavorite: favorites.includes(product.id)
        }));
    };
    // Initialize when DOM is ready
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        loadJQuery(init);
    } else {
        document.addEventListener('DOMContentLoaded', loadJQuery.bind(null, init));
    }
})();