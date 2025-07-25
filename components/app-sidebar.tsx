'use client'

import * as React from "react"

import { VersionSwitcher } from "@/components/version-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useState } from "react"
import { usePathname } from "next/navigation"

// Uygulama verisi - her uygulamanın kendi menüsü var
const applicationMenus = {
  "Nofap App": [
    {
      title: "Dashboard",
      url: "#",
      items: [
        { title: "Genel Bakış", url: "/" },
        { title: "İstatistikler", url: "/dashboard/statistics" }
      ]
    },
    {
      title: "Kullanıcılar",
      url: "#",
      items: [
        { title: "Tüm Kullanıcılar", url: "/users" },
        { title: "Roller & Yetkiler", url: "/users/roles" },
        { title: "Bildirim Tercihleri", url: "/users/notification" },
        { title: "Engellenenler", url: "/users/blocked" }
      ]
    },
    {
      title: "İçerik",
      url: "#",
      items: [
        { title: "Motivasyon & Mesajlar", url: "/contents/messages" },
        { title: "Görevler (Alışkanlık Karşıtı)", url: "/contents/tasks" },
        { title: "SSS / Yardım", url: "/contents/faq" }
      ]
    },
    {
      title: "Veri Takibi",
      url: "#",
      items: [
        { title: "Relapse Kayıtları", url: "/data/relapse" },
        { title: "Streak Durumu", url: "/data/streaks" },
        { title: "Kullanıcı Etkinliği", url: "/data/activity" }
      ]
    },
    {
      title: "Bildirimler",
      url: "#",
      items: [
        { title: "Planlı Bildirimler", url: "/notifications/scheduled" },
        { title: "Anlık Bildirim", url: "/notifications/send" },
        { title: "Bildirim Logları", url: "/notifications/logs" }
      ]
    },
    {
      title: "Satın Alma & Premium",
      url: "#",
      items: [
        { title: "Ürünler", url: "/billing/products" },
        { title: "Abonelikler", url: "/billing/subscribers" },
        { title: "Fatura Kayıtları", url: "/billing/logs" }
      ]
    },
    {
      title: "Reklamlar",
      url: "#",
      items: [
        { title: "Reklam Yönetimi", url: "/ads" },
        { title: "Reklam Ağı Ayarları", url: "/ads/settings" },
        { title: "Gelir Raporu", url: "/ads/income" }
      ]
    },
    {
      title: "Sistem & Güvenlik",
      url: "#",
      items: [
        { title: "Veri Güvenliği", url: "/security/encryption" },
        { title: "Log Takibi", url: "/security/logs" },
        { title: "IP / Cihaz Engelleme", url: "/security/devices" }
      ]
    },
    {
      title: "Ayarlar",
      url: "#",
      items: [
        { title: "Genel", url: "/settings/general" },
        { title: "Tema & UI", url: "/settings/ui" },
        { title: "Dil & Yerelleştirme", url: "/settings/language" },
        { title: "Sistem Ayarları", url: "/settings/system" }
      ]
    },
    {
      title: "Hakkında",
      url: "#",
      items: [
        { title: "Sürüm Bilgisi", url: "/about/version" },
        { title: "Geliştirici", url: "/about/developer" },
        { title: "Gizlilik Politikası", url: "/about/privacy" },
        { title: "Kullanım Şartları", url: "/about/terms" }
      ]
    }
  ],
  "Uygulama 2": [
    {
      title: "Proje Yönetimis",
      url: "#",
      items: [
        {
          title: "Projeler",
          url: "#",
        },
        {
          title: "Görevler",
          url: "#",
        },
      ],
    },
    {
      title: "Takım",
      url: "#",
      items: [
        {
          title: "Üyeler",
          url: "#",
        },
        {
          title: "Departmanlar",
          url: "#",
          isActive: true,
        },
        {
          title: "Raporlar",
          url: "#",
        },
      ],
    },
    {
      title: "Finans",
      url: "#",
      items: [
        {
          title: "Bütçe",
          url: "#",
        },
        {
          title: "Harcamalar",
          url: "#",
        },
        {
          title: "Faturalandırma",
          url: "#",
        },
      ],
    },
  ],
  "Uygulama 3": [
    {
      title: "E-ticaret",
      url: "#",
      items: [
        {
          title: "Ürünler",
          url: "#",
        },
        {
          title: "Kategoriler",
          url: "#",
        },
      ],
    },
    {
      title: "Sipariş Yönetimi",
      url: "#",
      items: [
        {
          title: "Siparişler",
          url: "#",
        },
        {
          title: "Kargo Takip",
          url: "#",
          isActive: true,
        },
        {
          title: "İadeler",
          url: "#",
        },
      ],
    },
    {
      title: "Müşteri Hizmetleri",
      url: "#",
      items: [
        {
          title: "Destek Talepleri",
          url: "#",
        },
        {
          title: "Canlı Sohbet",
          url: "#",
        },
        {
          title: "FAQ Yönetimi",
          url: "#",
        },
      ],
    },
    {
      title: "Analiz",
      url: "#",
      items: [
        {
          title: "Satış Raporları",
          url: "#",
        },
        {
          title: "Müşteri Analizi",
          url: "#",
        },
      ],
    },
  ],
}

const data = {
  versions: applicationMenus ? Object.keys(applicationMenus) : [],
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  onApplicationChange?: (application: string) => void
}

export function AppSidebar({ onApplicationChange, ...props }: AppSidebarProps) {
  const [currentApplication, setCurrentApplication] = useState(data.versions[0])

  const handleApplicationChange = (application: string) => {
    setCurrentApplication(application)
    onApplicationChange?.(application)
  }

  // Mevcut uygulamaya göre menüyü al
  const currentMenu = applicationMenus[currentApplication as keyof typeof applicationMenus] || []
  const pathname = usePathname();
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <VersionSwitcher
          versions={data.versions}
          defaultVersion={data.versions[0]}
          onVersionChange={handleApplicationChange}
        />
      </SidebarHeader>
      <SidebarContent className="overflow-y-auto">
        {/* Seçili uygulamaya göre menüyü göster */}
        {currentMenu.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map((menuItem) => {
                  const isActive = pathname === menuItem.url
                  return (
                    <SidebarMenuItem key={menuItem.title}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <a href={menuItem.url}>{menuItem.title}</a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}