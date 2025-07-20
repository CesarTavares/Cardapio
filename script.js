  const menu = document.getElementById("menu")
 const cartBtn = document.getElementById("cart-btn")
 const cartModal = document.getElementById("cart-modal")
 const cartItemsContainer = document.getElementById("cart-items")
 const cartTotal = document.getElementById("cart-total")
 const checkoutBtn = document.getElementById("checkout-btn")
 const closeModalBtn = document.getElementById("close-modal-btn")
 const cartCounter = document.getElementById("cart-count")
 const addressInput = document.getElementById("address")
 const addressWarn = document.getElementById("address-warn")

 let cart = [];

 //Abrir o modal do carrinho
cartBtn.addEventListener("click", function(){
   updateCartModal();
   cartModal.style.display ="flex"   
})

//Fechar o modal quando clicar fora
cartModal.addEventListener("click", function(event){
   if(event.target === cartModal){
        cartModal.style.display = "none"
   } 
})

closeModalBtn.addEventListener("click", function(){
    cartModal.style.display = "none"
})

menu.addEventListener("click", function(event){
    let parentButton = event.target.closest(".add-to-cart-btn")
    if(parentButton){
        const name = parentButton.getAttribute("data-name")
        const price = parseFloat(parentButton.getAttribute("data-price"))

        //adicionar no carrinho.
        addToCart(name, price)
    }
})

//Função para add no carrinho
function addToCart(name, price){
    const existingItem = cart.find(item => item.name === name)

    if(existingItem){
        //Se o item já exixte, aumenta apenas a quantidade  + 1
        existingItem.quantity += 1;
     
    }else{

       cart.push({
        name,
        price,
        quantity: 1,
        })

    } 
    
    updateCartModal()
}

//Atualiza no carrinho
function updateCartModal(){
    cartItemsContainer.innerHTML = "";
    let total = 0;

    cart.forEach(item => {
        const cartItemElement = document.createElement("div");
        cartItemElement.classList.add("flex", "justify-between", "mb-4", "flex-col")

        cartItemElement.innerHTML = `
        <div class="flex items-center justify-between">
            
                <div>
                    <p class="font-bold">${item.name}</p>
                    <p>Qtd: ${item.quantity}</p>
                    <p class="font-medium mt-2">R$: ${item.price.toFixed(2)}</p>
                </div>

                    <button class="remove-from-cart-btn" data-name="${item.name}">
                        Remover
                    </button>    
              
        </div>
        `

        total += item.price * item.quantity;

        cartItemsContainer.appendChild(cartItemElement)
    })

    cartTotal.textContent = total.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });

    cartCounter.innerHTML = cart.length;
}

//Remover o item do carrinho
cartItemsContainer.addEventListener("click", function(event){
    if(event.target.classList.contains("remove-from-cart-btn")){
        const name = event.target.getAttribute("data-name")

        removeItemCart(name);
    }
})

function removeItemCart(name){
    const index = cart.findIndex(item => item.name === name);

    if(index !== -1){
       const item = cart[index];
       
       if(item.quantity > 1){
        item.quantity -= 1;
        updateCartModal();
        return;
       }

       cart.splice(index, 1);
       updateCartModal();
    }
}

addressInput.addEventListener("input", function(event){
    let inputValue = event.target.value;

    if(inputValue !== ""){
        addressInput.classList.remove("border-red-500")
        addressWarn.classList.add("hidden")
    }
})

//Finalizar pedido
checkoutBtn.addEventListener("click", function(){

    const isOpen = checkRestaurantOpen();
    if(!isOpen){
        
         Toastify({
                text: "Ops o restaurante está fechado!",
                duration: 3000,
                close: true,
                gravity: "top", // `top` or `bottom`
                position: "right", // `left`, `center` or `right`
                stopOnFocus: true, // Prevents dismissing of toast on hover
                style: {
                  background: "#ef4444",
                },               
        }).showToast();
        return;
    }

    if(cart.length === 0) return;
    if(addressInput.value === ""){
        addressWarn.classList.remove("hidden")
        addressInput.classList.add("border-red-500")
        return;
    }

    //Enviar o pedido para api whats
    const cartItems = cart.map((item) => {
        return (
            `${item.name} Quantidade: (${item.quantity}) Preço: R$${item.price} |`
        )
    }).join("")

    const message = encodeURIComponent(cartItems)
    const phone = "18996729811"

    window.open(`https://wa.me/${phone}?text=${message} Endereço: ${addressInput.value}` , "_blank")

    cart = [];
    updateCartModal();
})

// function checkRestaurantOpen(){
//     const data = new Date();
//     const hora = data.getHours();
//     return hora >= 9 && hora < 15;    
// }

// const spanItem = document.getElementById("date-span")
// const isOpen = checkRestaurantOpen();

// if(isOpen){
//     spanItem.classList.remove("bg-red-500");
//     spanItem.classList.add("bg-green-600")
// }else{
//     spanItem.classList.remove("bg-green-600");
//     spanItem.classList.add("bg-red-500")
// }

// function isRestaurantOpen(openHour = 9, closeHour = 19) {
//     const now = new Date();
//     const currentHour = now.getHours();
//     return currentHour >= openHour && currentHour < closeHour;
// }

// function updateRestaurantStatus(spanElementId, openHour, closeHour) {
//     const span = document.getElementById(spanElementId);
//     if (!span) return;

//     const isOpen = isRestaurantOpen(openHour, closeHour);

//     span.classList.remove("bg-red-500", "bg-green-600");
//     span.classList.add(isOpen ? "bg-green-600" : "bg-red-500");
//     span.textContent = isOpen ? "Aberto" : "Fechado";
// }

// // Exemplo de uso
// updateRestaurantStatus("date-span", 9, 19);



function isRestaurantOpen({ openTime, closeTime, openDays }) {
    const now = new Date();
    const currentDay = now.getDay(); // 0 = domingo, 1 = segunda, ..., 6 = sábado
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const [openHour, openMinute] = openTime.split(":").map(Number);
    const [closeHour, closeMinute] = closeTime.split(":").map(Number);
    const openMinutes = openHour * 60 + openMinute;
    const closeMinutes = closeHour * 60 + closeMinute;

    const isDayOpen = openDays.includes(currentDay);
    const isHourOpen = currentMinutes >= openMinutes && currentMinutes < closeMinutes;

    return isDayOpen && isHourOpen;
}

function updateRestaurantStatus(spanElementId, config) {
    const span = document.getElementById(spanElementId);
    if (!span) return;

    const isOpen = isRestaurantOpen(config);

    span.classList.remove("bg-red-500", "bg-green-600");
    span.classList.add(isOpen ? "bg-green-600" : "bg-red-500");
    span.textContent = isOpen ? "Aberto agora" : "Fechado agora";
}
updateRestaurantStatus("date-span", {
    openTime: "09:30",           // abre às 09:30
    closeTime: "19:00",          // fecha às 15:00
    openDays: [1, 2, 3, 4, 5]    // 1 = segunda, ..., 5 = sexta
});

/* Explicando os openDays:
Segunda-feira: 1

Terça-feira: 2

Quarta-feira: 3

Quinta-feira: 4

Sexta-feira: 5

Sábado: 6

Domingo: 0  */