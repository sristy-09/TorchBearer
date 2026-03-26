import { Comment } from "../models/Comment.js";

export const addComment = async (req, res) => {
    try{
        const{text, userId} = req.body

        const comment = await Comment.create({
            text: text, 
            user: userId,
            post: req.params.postId,
        })
        res.status(201).json(comment)
    } catch(err){
        res.status(500).json(err.message)
    }
}

export const getComments = async (req, res) => {
    try{
        const comments = await Comment.find({
            post: req.params.postId,
        }).populate("user", "name role")

        res.json(comments)
    } catch (err){
        res.status(500).json(err.message)
    }
}