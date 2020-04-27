exports.getFavoriteCourses= async (req, req) => {
    try{
        const share = await req.db.Share.findById(req.param.ShareId)
        if (share.ownerId === req.user.id || share.recivers.includes(req.user.id))
        {
            const user = await req.user.findById(share.ownerId)
            return res.status(HttpStatus.OK).json({
                success: true,
                favorites: req.user.favoriteCourses
              })        
        }
        else{
            return res.status(HttpStatus.Unathorized).json({
                success: false,
                message: "you don't have rights to view this"
            })
        }
    }
    catch(e)
    {
        return res.status(HttpStatus.InternalServerError).json({
            success: false,
            message: "Something bad hapened!"
        })

    }
}