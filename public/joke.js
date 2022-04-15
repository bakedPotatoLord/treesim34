
fetch('https://www.petco.com/shop/en/petcostore/category/dog/dog-food/dry-dog-food')
.then(food => {
    dog.eat(food)
})
.catch((error,food)=> {
    if(error){
        dog.barf(food)
    }
});

class dog{
    constructor(name){
        this.name = name
    }

    eat = function(food){
        console.log(`that was some yummy ${food}`)
    }

    barf = function(food){
        console.log(`that was some gross ${food}`)
    }
}