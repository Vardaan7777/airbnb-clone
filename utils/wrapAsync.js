//Defining wrapAsync function [complicated way of using try and catch blocks]

module.exports = (fn) => {
    return (req, res ,next) => {
        fn(req,res,next).catch(next);
    }
}