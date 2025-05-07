import './scss/styles.scss';
import { AppData } from './components/AppData';
import { EventEmitter } from './components/base/events';
import { Card, CardPreview } from './components/Card';
import { CartItemView, CartView } from './components/CartView';
import { Modal } from './components/common/Modal';
import { Page } from './components/Page';
import { WebLarekApi } from './components/WebLarekApi';
import { ICustomerInfo, IDeliveryInfo, IProduct, IVisualState } from './types';
import { API_URL, CDN_URL } from './utils/constants';
import { cloneTemplate, ensureElement, getProductPriceText } from './utils/utils';
import { DeliveryInfo } from './components/DeliveryInfo';
import { CustomerInfo } from './components/CustomerInfo';
import { Success } from './components/Success';
import { Cart } from './components/Cart';

const events = new EventEmitter();
const api = new WebLarekApi(CDN_URL, API_URL);
const visualState: IVisualState = {
    cartModalIsVisible: false
}

// Модель данных приложения
const appData = new AppData(events);
const cart = new Cart(events);

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

// Статические части интерфейса
const deliveryInfoComponent = new DeliveryInfo(
    cloneTemplate(orderTemplate), 
    events, 
    deliveryFormName
);
const customerInfoComponent = new CustomerInfo(
    cloneTemplate(contactsTemplate), 
    events, 
    contactFormName
);
const successComponent = new Success(
    cloneTemplate(successTemplate), 
    {
        onContinueClick: () => {
            modal.close();
        }
    }
);
const cartComponent = new CartView(cloneTemplate(cartTemplate), {
    onPlaceOrderClick: () => events.emit('cart:placeOrder', {})
});

// Продукты загрузились
events.on('products:loaded', () => {
    if (!appData.products) {
        return;
    }
    
    page.catalog = appData.products.map(item => {
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
    const inCart = cart.products.some(p => p.id === product.id);
    const cardPreview = new CardPreview(
        'card', 
        cloneTemplate(cardPreviewTemplate), 
        inCart,
        {
            onAddButtonClick: () => {
                modal.close();
                events.emit('cart:add', product)
            },
            onRemoveButtonClick: () => {
                modal.close();
                events.emit('cart:remove', product)
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
events.on<IProduct>('cart:add', (product) => {
    cart.addProduct(product);
});

// Кликнули на кнопке "удалить" в модальном окне карточки продукта
events.on<IProduct>('cart:remove', (product) => {
    cart.removeProduct(product);
});

// Кликнули на иконке корзины
events.on('cart:open', () => {
    modal.render({
        content: renderCart()
    });

    visualState.cartModalIsVisible = true;
});

// Корзина обновилась
events.on('cart:change', () => {
    page.counter = cart.count;
    
    if (visualState.cartModalIsVisible) {
        modal.render({
            content: renderCart()
        });
    }
});

// Модальное окно закрылось
events.on('modal:close', () => {
    visualState.cartModalIsVisible = false;
});

// Нажали на кнопку "Оформить"
events.on('cart:placeOrder', () => {
    modal.render({
        content: deliveryInfoComponent.render({
            address: '',
            payment: 'online',
            valid: false,
            errors: []
        })
    });
});

// Изменяются данные в форме с выбором оплаты и адресом
events.on(`${deliveryFormName}:change`, (deliveryInfo: IDeliveryInfo) => {
    const { valid, errors } = appData.validateDeliveryInfo(deliveryInfo);
    deliveryInfoComponent.valid = valid;
    deliveryInfoComponent.errors = errors.join("; ");
    
    if (valid) {
        appData.deliveryInfo = deliveryInfo;
    }
});

// Нажимается кнопка "Далее" на форме с выбором оплаты и адресом
events.on(`${deliveryFormName}:submit`, () => {
    modal.render({
        content: customerInfoComponent.render({
            email: '',
            phone: '',
            valid: false,
            errors: []
        })
    });
});

// Изменяются данные в форме с контактами
events.on(`${contactFormName}:change`, (customerInfo: ICustomerInfo) => {
    const { valid, errors } = appData.validateCustomerInfo(customerInfo);
    customerInfoComponent.valid = valid;
    customerInfoComponent.errors = errors.join("; ");

    if (valid) {
        appData.customerInfo = customerInfo;
    }
});

// Нажимается кнопка "Оплатить" на форме с контактами
events.on(`${contactFormName}:submit`, () => {    
    const order = {
        ...appData.deliveryInfo,
        ...appData.customerInfo,
        total: cart.cost,
        items: cart.products.map(p => p.id)
    };
    api.postOrder(order).then(result => {
        cart.clear();
        appData.clearOrderInfo();

        modal.render({
            content: successComponent.render({
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
    appData.products = products;
}).catch(err => {
    console.error(err);
});

function renderCart() : HTMLElement {
    const cartProducts = cart.products.map((p, i) => {
        const item = new CartItemView(
            cloneTemplate(cartItemTemplate),
            {
                onRemoveItem: () => events.emit('cart:remove', p)
            }
        );

        return item.render({
            index: i + 1,
            title: p.title,
            price: getProductPriceText(p.price)
        });
    });

    return cartComponent.render({
        items: cartProducts,
        total: getProductPriceText(cart.cost),
        allowPlaceOrder: !!cart.cost
    });
}