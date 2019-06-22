package main

import (
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strings"
)

var username = ""
var password = ""

// Get is a handler that makes it easy to send out GET requests
func Get(url string) ([]byte, error) {
	var dummy []byte
	client := &http.Client{}
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		log.Println("did not create new GET request", err)
		return dummy, err
	}
	req.Header.Set("Origin", "localhost")
	req.SetBasicAuth(username, password)
	res, err := client.Do(req)
	if err != nil {
		log.Println("did not make request", err)
		return dummy, err
	}
	defer res.Body.Close()
	return ioutil.ReadAll(res.Body)
}

type Response struct {
	Sha string `json:"sha"`
}

func main() {
	repoBytes, err := ioutil.ReadFile("repos.txt")
	if err != nil {
		log.Fatal(err)
	}

	repos := strings.Split(string(repoBytes), "\n")

	sortedFile, err := os.OpenFile("sorted.txt", os.O_APPEND|os.O_WRONLY, 0600)
	if err != nil {
		panic(err)
	}

	repos = repos[0:len(repos)-1]
	for i, _ := range repos {
		packageNameI := strings.Split(repos[i], "/")[1][0];
		for j, _ := range repos {
			packageNameJ := strings.Split(repos[j], "/")[1][0];
			if packageNameJ > packageNameI {
				temp := repos[i]
				repos[i] = repos[j]
				repos[j] = temp
			}
		}
	}

	for _, repo := range repos {
		_, err = sortedFile.WriteString(repo + "\n")
		if err != nil {
			log.Fatal(err)
		}
	}

	resultFile, err := os.OpenFile("package.json", os.O_APPEND|os.O_WRONLY, 0600)
	if err != nil {
		panic(err)
	}

	for i, repo := range repos {
		packageName := strings.Split(repo, "/")
		data, err := Get("https://api.github.com/repos/" + repo + "/commits")
		if err != nil {
			log.Println(repo, string(data))
			continue
		}
		var x []Response
		err = ioutil.WriteFile("test.json", data, 0644)
		if err != nil {
			log.Println(repo, string(data))
			continue
		}
		err = json.Unmarshal(data, &x)
		if err != nil {
			log.Println(repo, string(data))
			continue
		}
		shaHash := x[0].Sha
		var packageString string
		if i == 0 {
			packageString = "{\n\"" + packageName[1] + "\": \"" + "git://github.com/" + repo + "#" + shaHash + "\",\n"
		} else {
			packageString = "\"" + packageName[1] + "\": \"" + "git://github.com/" + repo + "#" + shaHash + "\",\n"
		}
		_, err = resultFile.WriteString(packageString)
		if err != nil {
			log.Println(err)
			break
		}
	}
}
