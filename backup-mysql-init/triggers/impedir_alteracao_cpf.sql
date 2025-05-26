delimiter //

create trigger impedir_alteracao_cpf
before update on usuario
for each row
begin
    if old.cpf <> new.cpf then
        signal sqlstate '45000'
        set message_text = 'Não é permitido alterar o CPF de um usuário já cadastrado';
    end if;
end; //

delimiter ;