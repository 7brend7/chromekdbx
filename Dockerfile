FROM alpine:3.9

RUN apk add yarn zsh

CMD [ "tail", "-f", "/dev/null" ]