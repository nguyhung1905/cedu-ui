
export const PRIMARY = 'primary'
export const SECONDARY = 'secondary'
export const DANGER = 'danger'
export const WARNING = 'warning'
export const SUCCESS = 'success'
export const INFO = 'info'

export function showAlert(oThis, variant = null, message) {
    oThis.$bvToast.toast(message, {
        title: `Notification`,
        variant: variant,
        autoHideDelay: 3000,
        solid: true
    })
}

export function showConfirmDialog(oThis, message, action) {
    oThis.$bvModal.msgBoxConfirm(message, {
        title: 'Confirmation',
        size: 'md',
        buttonSize: 'sm',
        okVariant: 'primary',
        okTitle: 'YES',
        cancelTitle: 'NO',
        footerClass: 'p-2',
        hideHeaderClose: true,
        centered: true
    }).then(action)
}

export function showOkDialog(oThis, message) {
    oThis.$bvModal.msgBoxOk(message, {
        title: 'Notification',
        size: 'md',
        buttonSize: 'sm',
        okVariant: 'primary',
        okTitle: 'OK',
        footerClass: 'p-2',
        hideHeaderClose: true,
        centered: true
    }).then()
}
