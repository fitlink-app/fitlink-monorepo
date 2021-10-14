import Modal from './Modal'

export type AlertProps = {
  title: string
  message: string
  buttonText?: string
  close: () => void
}

export default function Alert({
  title,
  message,
  buttonText = 'Okay',
  close
}:AlertProps) {
  return (
    <Modal
      close={close}
      size="message"
      >
       <h4 className="h5">{title}</h4>
       <p>{message}</p>
       <div className="text-right mt-3">
         <button className="button" onClick={close}>{buttonText}</button>
       </div>
    </Modal>
  )
}