#!/usr/bin/env bash

docker run --network=host --cpus="2.0" --cpuset-cpus="0,1" --memory="4g" --memory-swap="4g" pw-bench