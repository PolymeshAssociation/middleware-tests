FROM vault

COPY ./vault-init.sh /

RUN chmod +x /vault-init.sh

ENTRYPOINT ["/vault-init.sh"]
