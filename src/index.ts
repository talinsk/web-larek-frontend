import './scss/styles.scss';
import { AppData } from './components/AppData';
import { EventEmitter } from './components/base/events';
import { Card, CardPreview } from './components/Card';
import { CartItemView, CartView } from './components/CartView';
import { Modal } from './components/common/Modal';
import { Page } from './components/Page';
import { WebLarekApi } from './components/WebLarekApi';
import { Cart, ICustomerInfo, IDeliveryInfo, IProduct } from './types';
import { API_URL, CDN_URL } from './utils/constants';
import { cloneTemplate, ensureElement, getProductPriceText } from './utils/utils';
import { DeliveryInfo } from './components/DeliveryInfo';
import { CustomerInfo } from './components/CustomerInfo';
import { Success } from './components/Success';

const events = new EventEmitter();
const api = new WebLarekApi(CDN_URL, API_URL)

// Модель данных приложения
const appData = new AppData(events, new Cart(events));

// константы имен форм
const deliveryFormName = "deliveryForm";
const contactFormName = "contactForm";

// Все шаблоны
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const cartTemplate = ensureElement<HTMLTemplateElement>('#basket');
const cartItemTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');

// Глобальные контейнеры
const page = new Page(document.body, { onCartClick: () => events.emit('cart:open') });
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);

// Продукты загрузились
events.on<IProduct[]>('products:loaded', (products) => {
    page.catalog = products.map(item => {
        const card = new Card('card', cloneTemplate(cardCatalogTemplate), {
            onClick: () => events.emit('card:click', item)
        });
        return card.render({
            category: item.category,
            title: item.title,
            image: item.image,
            price: item.price,
        });
    });
});

// Кликнули на карточке продукта
events.on<IProduct>('card:click', (product) => {
    const inCart = appData.cart.products.some(p => p.id === product.id);
    const cardPreview = new CardPreview(
        'card', 
        cloneTemplate(cardPreviewTemplate), 
        inCart,
        {
            onAddButtonClick: () => {
                modal.close();
                events.emit('card:add', product)
            },
            onRemoveButtonClick: () => {
                modal.close();
                events.emit('card:remove', product)
            }
        }
    );
    
    modal.render({
        content: cardPreview.render({
            category: product.category,
            title: product.title,
            image: product.image,
            price: product.price,
            description: product.description,
            inCart: inCart,
        })
    });
});

// Кликнули на кнопке "купить" в модальном окне карточки продукта
events.on<IProduct>('card:add', (product) => {
    appData.cart.addProduct(product);
});

// Кликнули на кнопке "удалить" в модальном окне карточки продукта
events.on<IProduct>('card:remove', (product) => {
    appData.cart.removeProduct(product);
});

// Кликнули на иконке корзины
events.on<IProduct>('cart:open', () => {
    modal.render({
        content: renderCart()
    });

    appData.cartIsVisible = true;
});

// Корзина обновилась
events.on<IProduct>('cart:change', () => {
    page.counter = appData.cart.count;
    
    if (appData.cartIsVisible) {
        modal.render({
            content: renderCart()
        });
    }
});

// Модальное окно закрылось
events.on('modal:close', () => {
    appData.cartIsVisible = false;
});

// Нажали на кнопку "Оформить"
events.on('cart:placeOrder', () => {
    const deliveryInfo = new DeliveryInfo(cloneTemplate(orderTemplate), events, deliveryFormName);
    appData.deliveryInfoComponent = deliveryInfo;
    modal.render({
        content: deliveryInfo.render({
            address: '',
            payment: 'online',
            valid: false,
            errors: []
        })
    });
});

// Изменяются данные в форме с выбором оплаты и адресом
events.on(`${deliveryFormName}:change`, (deliveryInfo: IDeliveryInfo) => {
    appData.setDeliveryInfo(deliveryInfo);
});

// Нажимается кнопка "Далее" на форме с выбором оплаты и адресом
events.on(`${deliveryFormName}:submit`, () => {
    appData.deliveryInfoComponent = null;
    const customerInfo = new CustomerInfo(cloneTemplate(contactsTemplate), events, contactFormName);
    appData.customerInfoComponent = customerInfo;
    modal.render({
        content: customerInfo.render({
            email: '',
            phone: '',
            valid: false,
            errors: []
        })
    });
});

// Изменяются данные в форме с контактами
events.on(`${contactFormName}:change`, (deliveryInfo: ICustomerInfo) => {
    appData.setContactInfo(deliveryInfo);
});

// Нажимается кнопка "Оплатить" на форме с контактами
events.on(`${contactFormName}:submit`, () => {    
    appData.customerInfoComponent = null;
    const order = appData.order;
    api.postOrder(order).then(result => {
        appData.cart.clear();
        appData.clearOrder();
        const success = new Success(cloneTemplate(successTemplate), {
            onContinueClick: () => {
                modal.close();
            }
        });

        modal.render({
            content: success.render({
                description: `Списано ${result.total} синапсов`
            })
        });
    })
    .catch(err => {
        console.error(err);
    })
});



// загрузка товаров
api.getProducts().then(products => {
    events.emit('products:loaded', products);    
}).catch(err => {
    console.error(err);
});

function renderCart() : HTMLElement {
    const cartProducts = appData.cart.products.map((p, i) => {
        const item = new CartItemView(
            cloneTemplate(cartItemTemplate),
            {
                onRemoveItem: () => events.emit('card:remove', p)
            }
        );

        return item.render({
            index: i + 1,
            title: p.title,
            price: getProductPriceText(p.price)
        });
    });

    const cartView = new CartView(cloneTemplate(cartTemplate), {
        onPlaceOrderClick: () => events.emit('cart:placeOrder', {})
    });

    return cartView.render({
        items: cartProducts,
        total: getProductPriceText(appData.cart.cost),
        allowPlaceOrder: !!appData.cart.cost
    });
}