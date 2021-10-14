import Modal from './Modal'

export type ConfirmProps = {
  title: string
  message: string
  onConfirm: () => void
  cancelText?: string
  confirmText?: string
  close: () => void
}

export default function Confirm({
  title,
  message,
  onConfirm,
  cancelText = 'Cancel',
  confirmText = 'Confirm',
  close
}:ConfirmProps) {
  return (
    <Modal
      close={close}
      hideCloseButton={true}
      size="message"
      >
       <h4 className="h5">{title}</h4>
       <p>{message}</p>
       <div className="text-right mt-3">
         <button className="button alt">{cancelText}</button>
         <button className="button ml-1" onClick={onConfirm}>{confirmText}</button>
       </div>
    </Modal>
  )
}