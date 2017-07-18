package main

import (
	"fmt"
	"time"

	"github.com/json-iterator/go"
)

// Employee is a Test object, with JSON tags.
type Employee struct {
	ID        int       `json:"id,omitempty"`
	Name      string    `json:"name,omitempty"`
	Address   string    `json:"address,omitempty"`
	DoB       time.Time `json:"do_b,omitempty"`
	Position  string    `json:"position,omitempty"`
	Salary    int       `json:"salary,omitempty"`
	ManagerID int       `json:"manager_id,omitempty"`
}

func main() {
	var dilbert Employee
	dilbert.ID = 1
	dilbert.Name = "dilbert"

	b, _ := jsoniter.Marshal(&dilbert)
	fmt.Println(string(b))
}
