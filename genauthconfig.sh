#!/bin/bash

config="{\"authDatabase\": {"
configFilename="authConfig.json"
hash="sha512"
i=0

while [[ true ]]; do
    if [[ $i -gt 0 ]]; then
        config=${config}","
    fi
    read -p "Enter an username: " username
    while [[ -z "$username" ]]; do
        echo "The username must not be empty"
        read -p "Enter an username: " username
    done

    read -p "Enter a password: " password
    while [[ -z "$password" ]]; do
        echo "The password must not be empty"
        read -p "Enter a password: " password
    done

    password=$(echo -n $password | sha512sum | cut -d " " -f 1)

    config=${config}"\"$username\": \"$password\""
    read -p "Do you want to add another username? (y/n):" answer

    stop=0
    case $answer in
        "n" | "N" | "no" | "No")
            stop=1
        ;;
        "y" | "Y" | "yes" | "Yes")
            stop=0
        ;;
        *)
            echo "Invalid option, defaulting to no"
            stop=1
        ;;
    esac
    if [[ $stop -eq 1 ]]; then
        break;
    fi
    i=$(( $i + 1 ))
done

config=${config}"},"
config=${config}"\"hash\": \"$hash\""
config=${config}"}"

echo $config > $configFilename
echo "Successfully generated the auth config file at $configFilename"
