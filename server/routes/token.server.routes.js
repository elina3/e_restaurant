'use strict';

var tokenController = require('../controllers/token');

module.exports = function (app) {

    /**
     * @api {get} /token/image/upload 图片上传凭据获取
     * @apiDescription 获取图片上传凭据
     * @apiVersion 0.0.1
     * @apiName getActivityConfig
     * @apiGroup User
     *
     * @apiSuccess (Success) {Object} token 图片上传凭据.
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *            "token": "Cl6lOoIMwux5wdigvdJ2nUsVOsgK_ti5miklg1dh:uPxXaRZGFkZZDFmggXZ_at-KnDU=:eyJzY29wZSI6InotcHJvamVjdCIsImRlYWRsaW5lIjoxNDYwNDQ2OTI0fQ=="
     *     }
     */
    app.route('/token/image/upload').get(tokenController.uploadToken);//for App and Web
};
