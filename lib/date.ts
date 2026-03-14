import dayjs from "dayjs"
import "dayjs/locale/pt-br"

dayjs.locale("pt-br")

export function formatDate(date?: string | null) {
    if (!date) return null

    const d = dayjs(date)

    if (!d.isValid()) return null

    return d.format("DD/MM/YYYY")
}

export function formatPretty(date?: string | null) {
    if (!date) return null

    const d = dayjs(date)

    if (!d.isValid()) return null

    return d.format("D [de] MMMM [de] YYYY")
}