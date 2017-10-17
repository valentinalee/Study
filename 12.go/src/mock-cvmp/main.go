package main

import "github.com/gin-gonic/gin"
import "strings"
import "fmt"

type RefreshToken struct {
	AppID        string `form:"appId" json:"appId" binding:"required"`
	Secret       string `form:"secret" json:"secret" binding:"required"`
	RefreshToken string `form:"refreshToken" json:"refreshToken" binding:"required"`
}

func AuthRequired() gin.HandlerFunc {
	return func(c *gin.Context) {
		appID := c.GetHeader("App_key")
		auth := c.GetHeader("Authorization")
		fmt.Printf("app_key:%s App_key:%s auth:%s \n", c.GetHeader("app_key"), c.GetHeader("App_key"), auth)
		token := ""

		authArray := strings.Split(auth, " ")
		if len(authArray) >= 2 {
			token = authArray[1]
		}

		if appID == "test" && (token == "950a7cc9-5a8a-42c9-a693-40e817b1a4b0" || token == "56465b41-429d-436c-ad8d-613d476ff322") {

			c.Next()
		} else {
			c.AbortWithStatusJSON(401, gin.H{
				"error_code": 100000,
				"error_desc": "token error.",
			})
		}

	}
}

func main() {
	r := gin.Default()

	iocm := r.Group("/iocm/app/sec/v1.1.0")
	{
		iocm.POST("/login", func(c *gin.Context) {
			appID := c.PostForm("appId")
			secret := c.PostForm("secret")

			if (strings.TrimSpace(appID) == "test") && (strings.TrimSpace(secret) == "test") {

				c.JSON(200, gin.H{
					"accessToken":  "950a7cc9-5a8a-42c9-a693-40e817b1a4b0",
					"tokenType":    "bearer",
					"expiresIn":    7200,
					"refreshToken": "773a0fcd-6023-45f8-8848-e141296cb3cb",
					"scope":        "default",
				})
			} else {
				c.JSON(401, gin.H{
					"error_code": 100208,
					"error_desc": "AppId or secret is not right.",
				})
			}
		})

		iocm.POST("/refreshToken", func(c *gin.Context) {
			var token RefreshToken

			if c.Bind(&token) == nil {
				if token.AppID == "test" && token.Secret == "test" {
					if token.RefreshToken == "773a0fcd-6023-45f8-8848-e141296cb3cb" {
						c.JSON(200, gin.H{
							"accessToken":  "56465b41-429d-436c-ad8d-613d476ff322",
							"tokenType":    "bearer",
							"expiresIn":    7200,
							"refreshToken": "773a0fcd-6023-45f8-8848-e141296cb3cb",
							"scope":        "default",
						})
					} else {

						c.JSON(401, gin.H{
							"error_code": 100006,
							"error_desc": "Refresh access token failed.",
						})
					}
				} else {
					c.JSON(401, gin.H{
						"error_code": 100208,
						"error_desc": "AppId or secret is not right.",
					})
				}
			}

		})
	}

	api := r.Group("/api/v1.0")
	api.Use(AuthRequired())
	{
		api.POST("/command/action/sendCommand", func(c *gin.Context) {
			var json map[string]interface{}

			if c.BindJSON(&json) == nil {
				c.JSON(200, gin.H{
					"requestId": json["requestId"],
					"commandId": "********",
				})
			} else {
				c.JSON(400, gin.H{
					"error_code": 100000,
					"error_desc": "error",
				})
			}
		})
	}

	r.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "hello",
		})
	})
	r.Run() // listen and serve on 0.0.0.0:8080
}
