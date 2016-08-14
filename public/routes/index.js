var express = require('express');
var path = require('path');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {

  res.status(200).render('layout');
});
router.get('/blocks/*/*', function(req,res) {
    res.status(200).render('layout');
});
router.get('/transactions/*', function(req,res) {
    res.status(200).render('layout');
});
router.get('/address/*/*', function(req,res) {
    res.status(200).render('layout');
});
router.get('/status', function(req,res) {
    res.status(200).render('layout');
});
router.get('/allBlocks/*', function(req,res) {
    res.status(200).render('layout');
});
router.get('/motions', function(req,res) {
    res.status(200).render('layout');
});
router.get('/motions_passed', function(req,res) {
    res.status(200).render('layout');
});
router.get('/motions_passed', function(req,res) {
    res.status(200).render('layout');
});
router.get('/votedfor/motion/*/*', function(req,res) {
    res.status(200).render('layout');
});
router.get('/votedfor/custodian/*/*', function(req,res) {
    res.status(200).render('layout');
});
router.get('/custodians', function(req,res) {
    res.status(200).render('layout');
});
router.get('/custodians_passed', function(req,res) {
    res.status(200).render('layout');
});
router.get('/charts/*', function(req,res) {
    res.status(200).render('layout');
});
router.get('/status/richListBKS', function(req,res) {
    res.status(200).render('layout');
});
router.get('/apis', function(req,res) {
    res.status(200).render('layout');
});

module.exports = router;
