

module.exports.getResource = (req, res) => {
    console.log('Returning the resource');
    res.status(200).send('Here is the resource');
};
