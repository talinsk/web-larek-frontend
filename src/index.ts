import './scss/styles.scss';
import { OrderModel } from './components/models/OrderModel';
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
import { CartModel } from './components/models/CartModel';
import { ProductsModel } from './components/models/ProductsModel';

const events = new EventEmitter();
const api = new WebLarekApi(CDN_URL, API_URL);
const visualState: IVisualState = {
    cartModalIsVisible: false
}

// Модель данных приложения
const orderData = new OrderModel();
const cartData = new CartModel(events);
const productsData = new ProductsModel(events);

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
    if (!productsData.products) {
        return;
    }

    page.catalog = productsData.products.map(item => {
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
    const inCart = cartData.products.some(p => p.id === product.id);
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
    cartData.addProduct(product);
});

// Кликнули на кнопке "удалить" в модальном окне карточки продукта
events.on<IProduct>('cart:remove', (product) => {
    cartData.removeProduct(product);
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
    page.counter = cartData.count;
    
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
    const { valid, errors } = orderData.validateDeliveryInfo(deliveryInfo);
    deliveryInfoComponent.valid = valid;
    deliveryInfoComponent.errors = errors.join("; ");
    
    if (valid) {
        orderData.deliveryInfo = deliveryInfo;
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
    const { valid, errors } = orderData.validateCustomerInfo(customerInfo);
    customerInfoComponent.valid = valid;
    customerInfoComponent.errors = errors.join("; ");

    if (valid) {
        orderData.customerInfo = customerInfo;
    }
});

// Нажимается кнопка "Оплатить" на форме с контактами
events.on(`${contactFormName}:submit`, () => {    
    const orderRequest = {
        ...orderData.deliveryInfo,
        ...orderData.customerInfo,
        total: cartData.cost,
        items: cartData.products.map(p => p.id)
    };
    api.postOrder(orderRequest).then(result => {
        cartData.clear();
        orderData.clearOrderInfo();

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
    productsData.products = products;
}).catch(err => {
    console.error(err);
});

function renderCart() : HTMLElement {
    const cartProducts = cartData.products.map((p, i) => {
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
        total: getProductPriceText(cartData.cost),
        allowPlaceOrder: !!cartData.cost
    });
}