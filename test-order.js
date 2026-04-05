const { sequelize } = require('./config/db');
const Order = require('./models/Order');

async function test() {
    await sequelize.authenticate();
    try {
        const newOrder = await Order.create({ 
            userId: 1, 
            userName: 'Test User', 
            items: [{ menuItemId: 1, name: 'Burger', quantity: 1, price: 100 }], 
            totalPrice: 100, 
            deliveryTime: '30 mins', 
            deliveryLocation: 'Desk' 
        });
        console.log('Order created:', newOrder.toJSON());
    } catch (e) {
        console.error('Validation error:', e);
    }
    process.exit();
}
test();
