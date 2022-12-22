const CART = {
    KEY: 'bkasjbdfkjasdkfjhaksdfjskd',
    contents: [],
    init(){
        //check localStorage and initialize the contents of CART.contents
        let _contents = localStorage.getItem(CART.KEY);
        if(_contents){
            CART.contents = JSON.parse(_contents);
        }else{
            //dummy test data
            CART.contents = [
                {id:1, title:'Apple', qty:1, itemPrice: 0.85},
                {id:2, title:'Banana', qty:1, itemPrice: 0.35},
                {id:3, title:'Cherry', qty:1, itemPrice: 0.05}
            ];
            CART.sync();
        }
    },
    async sync(){
        let _cart = JSON.stringify(CART.contents);
        await localStorage.setItem(CART.KEY, _cart);
    },
    find(id){
        //find an item in the cart by it's id
        let match = CART.contents.filter(item=>{
            if(item.id == id)
                return true;
        });
        if(match && match[0])
            return match[0];
    },
    add(id){
        //add a new item to the cart
        //check that it is not in the cart already
        if(CART.find(id)){
            CART.increase(id, 1);
        }else{
            let arr = PRODUCTS.filter(product=>{
                if(product.id == id){
                    return true;
                }
            });
            if(arr && arr[0]){
                let obj = {
                    id: arr[0].id,
                    title: arr[0].title,
                    qty: 1,
                    price: arr[0].price,
                    img: arr[0].img,
                    category: arr[0].category
                };
                CART.contents.push(obj);
                //update localStorage
                CART.sync();
            }else{
                //product id does not exist in products data
                console.error('Invalid Product');
            }
        }
    },
    increase(id, qty=1){
        //increase the quantity of an item in the cart
        CART.contents = CART.contents.map(item=>{
            if(item.id === id)
                item.qty = item.qty + qty;
            return item;
        });
        //update localStorage
        CART.sync()
    },
    reduce(id, qty=1){
        //reduce the quantity of an item in the cart
        CART.contents = CART.contents.map(item=>{
            if(item.id === id)
                item.qty = item.qty - qty;
            return item;
        });
        CART.contents.forEach(async item=>{
            if(item.id === id && item.qty === 0)
                await CART.remove(id);
        });
        //update localStorage
        CART.sync()
    },
    remove(id){
        //remove an item entirely from CART.contents based on its id
        CART.contents = CART.contents.filter(item=>{
            if(item.id !== id)
                return true;
        });
        //update localStorage
        CART.sync()

    },
    empty(){
        //empty whole cart
        CART.contents = [];
        //update localStorage
        CART.sync()
    },
    sort(field='title'){
        //sort by field - title, price
        //return a sorted shallow copy of the CART.contents array
        let sorted = CART.contents.sort( (a, b)=>{
            if(a[field] > b[field]){
                return 1;
            }else if(a[field] < a[field]){
                return -1;
            }else{
                return 0;
            }
        });
        return sorted;
        //NO impact on localStorage
    },
    logContents(prefix){
        console.log(prefix, CART.contents)
    }
};

let PRODUCTS = [];

document.addEventListener('DOMContentLoaded', ()=>{
    //when the page is ready
    getProducts( showProducts, errorMessage );
    //get the cart items from localStorage
    CART.init();
    //load the cart items
    showCart();
});

function showCart(){
    let cartSection = document.getElementById('cart products clearfix');
    cart.innerHTML = '';
    let s = CART.sort('id');
    s.forEach( item =>{
        let cartitem = document.createElement('li');
        cartitem.className = 'product-wrapper';

        let link = document.createElement('a');
        link.className = 'product'
        link.href = item.category;
        cartitem.appendChild(link)

        let photo_block = document.createElement('div');
        photo_block.className = 'product-photo'
        link.appendChild(photo_block);

        let photo = document.createElement('img')
        photo.src = 'img/'+item.img
        console.log(item.img)
        photo_block.appendChild(photo)

        let title = document.createElement('h1');
        title.textContent = item.title;
        title.className = 'names'
        link.appendChild(title);

        let price = document.createElement('h1');
        price.textContent = item.price;
        price.className = 'price'
        link.appendChild(price);

        let controls = document.createElement('div');
        controls.className = 'controls';
        cartitem.appendChild(controls);

        let plus = document.createElement('span');
        plus.textContent = '+';
        plus.style = 'padding: 10px 10px; background-color:green;q'
        plus.setAttribute('data-id', item.id)
        controls.appendChild(plus);
        plus.addEventListener('click', incrementCart)

        let qty = document.createElement('span');
        qty.textContent = item.qty;
        controls.appendChild(qty);

        let minus = document.createElement('span');
        minus.textContent = '-';
        minus.style = 'padding: 10px 10px; background-color:red'
        minus.setAttribute('data-id', item.id)
        controls.appendChild(minus);
        minus.addEventListener('click', decrementCart)

        // let price = document.createElement('div');
        // price.className = 'price';
        // let cost = new Intl.NumberFormat('en-CA',
        //     {style: 'currency', currency:'CAD'}).format(item.qty * item.itemPrice);
        // price.textContent = cost;
        // cartitem.appendChild(price);

        cartSection.appendChild(cartitem);
    })
}

function incrementCart(ev){
    ev.preventDefault();
    let id = parseInt(ev.target.getAttribute('data-id'));
    CART.increase(id, 1);
    let controls = ev.target.parentElement;
    let qty = controls.querySelector('span:nth-child(2)');
    let item = CART.find(id);
    if(item){
        qty.textContent = item.qty;
    }else{
        document.getElementById('cart').removeChild(controls.parentElement);
    }
}

function decrementCart(ev){
    ev.preventDefault();
    let id = parseInt(ev.target.getAttribute('data-id'));
    CART.reduce(id, 1);
    let controls = ev.target.parentElement;
    let qty = controls.querySelector('span:nth-child(2)');
    let item = CART.find(id);
    if(item){
        qty.textContent = item.qty;
    }else{
        document.getElementById('cart').removeChild(controls.parentElement);
    }
}

function getProducts(success, failure){
    //request the list of products from the "server"
    const URL = "csgo.json";
    fetch(URL, {
        method: 'GET',
        mode: 'cors'
    })
        .then(response=>response.json())
        .then(showProducts)
        .catch(err=>{
            errorMessage(err.message);
        });
}

function showProducts( products ){

    PRODUCTS = products;
    products = products.filter(function (n){
        console.log(n.category)
        return n.category === window.location.pathname.split('/').pop();
    });
    //take data.products and display inside <section id="products">
    let imgPath = 'img/';
    let productSection = document.getElementById('products clearfix');
    productSection.innerHTML = "";
    products.forEach(product=>{
        let productWrapper = document.createElement('li');
        productWrapper.className = 'product-wrapper';
        //add the image to the productWrapper
        let btn = document.createElement('a');
        btn.className = 'product';
        btn.setAttribute("onclick",`addItem(${product.id})`)
        productWrapper.appendChild(btn);
        let productPhoto = document.createElement('div')
        productPhoto.className = 'product-photo'
        btn.appendChild(productPhoto)
        let img = document.createElement('img');
        img.alt = product.title;
        img.src = imgPath + product.img;
        productPhoto.appendChild(img);
        //add the price
        let price = document.createElement('p');
        let cost = new Intl.NumberFormat('en-CA',
            {style:'currency', currency:'CAD'}).format(product.price);
        price.textContent = cost;
        price.className = 'price';
        btn.appendChild(price);

        //add the button to the

        //add the productWrapper to the section
        productSection.appendChild(productWrapper);
    })
}

function addItem(ev){
    // let id = parseInt(ev.target.getAttribute('data-id'));
    let id = ev
    // console.log('add to cart item', id);
    CART.add(id, 1);
    showCart();
}

function errorMessage(err) {
    //display the error message to the user
    console.error(err);
}