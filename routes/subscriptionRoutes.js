const express = require('express');
const router = express.Router();
const subscriptionService = require('../services/subscriptionService');

// Get all subscriptions for a subscription
router.get('/:subscriptionId', async (req, res) => {
    try {
        const subscriptions = await subscriptionService.getsubscriptionSubscriptions(req.params.subscriptionId);
        res.json(subscriptions);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch subscriptions' });
    }
});

// Add new subscription
router.post('/:subscriptionId', async (req, res) => {
    try {
        const result = await subscriptionService.addSubscription(req.params.subscriptionId, req.body);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add subscription' });
    }
});

// Update subscription
router.put('/:subscriptionId', async (req, res) => {
    try {
        const result = await subscriptionService.updateSubscription(
            req.params.subscriptionId,
            req.body
        );
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update subscription' });
    }
});

// Delete subscription
router.delete('/:subscriptionId/ :serviceID', async (req, res) => {
    try {
        const result = await subscriptionService.deleteSubscription(
            req.params.subscriptionId,
            req.params.subscriptionId
        );
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete subscription' });
    }
});

// Process payment
router.post('/:subscriptionId/payment', async (req, res) => {
    try {
        const result = await subscriptionService.processPayment(
            req.params.subscriptionId,
            req.params.subscriptionId,
            req.body
        );
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Failed to process payment' });
    }
});

module.exports = router;