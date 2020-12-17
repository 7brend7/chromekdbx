FROM alpine

RUN apk add nodejs yarn zsh

CMD [ "tail", "-f", "/dev/null" ]
