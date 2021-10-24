import styles from './styles.module.scss'
import logoImg from '../../assets/logo.svg'
import io from 'socket.io-client'
import { api } from '../../services/api'
import { useEffect, useState } from 'react'

type Message = {
  id: string;
  text: string;
  user: {
    name: string;
    avatar_url: string;
  }
}

// criar uma fila de mensagens
const messagesQueue: Message[] = [];

const socket = io('http://localhost:4000');

// isso vai ouvir o backend
socket.on('new_message', (newMessage: Message) => {
  messagesQueue.push(newMessage);
})

export function MessageList() {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      if(messagesQueue.length > 0){
        // como preciso das informações do estado anterior passamos o novo estado com o prevState
        setMessages(prevState => [
          messagesQueue[0],
          prevState[0],
          prevState[1],
        ].filter(Boolean))
        //.filter(Boolean) remove valores falses, undefined, vazio, nulos...
        messagesQueue.shift();
      }
    }, 3000)
  },[]);

  useEffect(() => {
    // carregar os dados assim que o componente é exibido em tela
    // é uma função que recebe dois parâmetros, o que eu quero executar e quando
    // chamada para api para buscar os dados
    api.get<Message[]>('messages/last3').then(response => {
      setMessages(response.data);
    })
  }, []);

  return (
    <div className={styles.messageListWrapper}>
      <img src={logoImg} alt="DoWhile 2021" />

      <ul className={styles.messageList}>
        {messages.map((message) => {
          return (
            <li className={styles.message} key={message.id}>
              <p className={styles.messageContent}>{message.text}</p>
              <div className={styles.messageUser}>
                <div className={styles.userImage}>
                  <img src={message.user.avatar_url} alt={message.user.name} />
                </div>
                <span>{message.user.name}</span>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}