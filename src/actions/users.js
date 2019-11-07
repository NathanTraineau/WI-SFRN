/*var Heros = require('./heros.dao');


createHero = function (req, res, next) {
    var hero = {
        name: req.body.name,
        description: req.body.description
    };

    Heros.create(hero, function(err, hero) {
        if(err) {
            res.json({
                error : err
            })
        }
        res.json({
            message : "Hero created successfully"
        })
    })
}


exports.product_create = function (req, res) {
    let user = new User(
        {
            name: req.body.name,
            price: req.body.price
        }
    );

    product.save(function (err) {
        if (err) {
            return next(err);
        }
        res.send('user Created successfully')
    })
};*/