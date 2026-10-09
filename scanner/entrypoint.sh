#!/bin/bash

echo "Waiting for external infrastructure..."
sleep 5 # Optional delay to let postgres/rabbitmq start

echo "Starting Java application..."
exec java -jar app.jar
