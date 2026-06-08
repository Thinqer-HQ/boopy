# Boopy UI Context

This document contains all existing UI code for Boopy — a Next.js AI chatbot app using Supabase for auth and data, Tailwind CSS, and shadcn/ui primitives.

GitHub repo: https://github.com/Thinqer-HQ/boopy

---

## Design System — `app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 240 10% 3.9%;
    --muted: 240 4.8% 95.9%;
    --muted-foreground: 240 3.8% 46.1%;
    --popover: 0 0% 100%;
    --popover-foreground: 240 10% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 240 10% 3.9%;
    --border: 240 5.9% 90%;
    --input: 240 5.9% 90%;
    --primary: 240 5.9% 10%;
    --primary-foreground: 0 0% 98%;
    --secondary: 240 4.8% 95.9%;
    --secondary-foreground: 240 5.9% 10%;
    --accent: 240 4.8% 95.9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --ring: 240 5% 64.9%;
    --radius: 0.5rem;
  }
  .dark {
    --background: 240 10% 3.9%;
    --foreground: 0 0% 98%;
    --muted: 240 3.7% 15.9%;
    --muted-foreground: 240 5% 64.9%;
    --popover: 240 10% 3.9%;
    --popover-foreground: 0 0% 98%;
    --card: 240 10% 3.9%;
    --card-foreground: 0 0% 98%;
    --border: 240 3.7% 15.9%;
    --input: 240 3.7% 15.9%;
    --primary: 0 0% 98%;
    --primary-foreground: 240 5.9% 10%;
    --secondary: 240 3.7% 15.9%;
    --secondary-foreground: 0 0% 98%;
    --accent: 240 3.7% 15.9%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 85.7% 97.3%;
    --ring: 240 3.7% 15.9%;
  }
}
@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

---

## App Structure

```
app/
  layout.tsx          — Root layout: Header + main wrapper
  page.tsx            — Home page: renders <Chat> with a fresh id
  chat/[id]/page.tsx  — Existing chat page
  share/[id]/page.tsx — Public share page (read-only)
  sign-in/page.tsx    — Sign in page
  sign-up/page.tsx    — Sign up page

components/
  header.tsx          — Sticky top bar: sidebar toggle, user menu, GitHub/Deploy buttons
  sidebar.tsx         — Slide-out sheet panel triggered by hamburger button
  sidebar-list.tsx    — List of past chats inside the sidebar
  sidebar-item.tsx    — Single chat row with share/delete actions
  sidebar-actions.tsx — Share + delete dialogs for a chat item
  sidebar-footer.tsx  — Bottom of sidebar: theme toggle + clear history
  chat.tsx            — Main chat orchestrator (useChat hook)
  chat-list.tsx       — Renders all messages with separators
  chat-message.tsx    — Single message row (user or AI avatar + markdown)
  chat-panel.tsx      — Fixed bottom bar: stop/regenerate buttons + prompt form
  prompt-form.tsx     — Textarea input with new-chat and send buttons
  empty-screen.tsx    — Welcome card with example prompt buttons
  user-menu.tsx       — Dropdown: avatar/initials, name, email, logout
  login-form.tsx      — Email + password form (sign-in or sign-up mode)
  login-button.tsx    — GitHub OAuth button (conditional on env flag)
  clear-history.tsx   — "Clear history" button with confirmation dialog
  theme-toggle.tsx    — Sun/moon icon button to toggle light/dark
  footer.tsx          — Small centered text footer
```

---

## Pages

### `app/layout.tsx` — Root Layout

```tsx
export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("font-sans antialiased", fontSans.variable, fontMono.variable)}>
        <Toaster />
        <Providers attribute="class" defaultTheme="system" enableSystem>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="bg-muted/50 flex flex-1 flex-col">{children}</main>
          </div>
          <TailwindIndicator />
        </Providers>
      </body>
    </html>
  );
}
```

### `app/page.tsx` — Home (New Chat)

```tsx
export default function IndexPage() {
  const id = nanoid();
  return <Chat id={id} />;
}
```

### `app/sign-in/page.tsx` — Sign In

```tsx
return (
  <div className="flex h-[calc(100vh-theme(spacing.16))] flex-col items-center justify-center py-10">
    <div className="w-full max-w-sm">
      <LoginForm action="sign-in" />
      <Separator className="my-4" />
      <div className="flex justify-center">
        <LoginButton />
      </div>
    </div>
  </div>
);
```

### `app/sign-up/page.tsx` — Sign Up

Same layout as sign-in but `action="sign-up"` on `<LoginForm>`.

### `app/share/[id]/page.tsx` — Shared Chat (Read-only)

```tsx
return (
  <>
    <div className="flex-1 space-y-6">
      <div className="bg-background border-b px-4 py-6 md:px-6 md:py-8">
        <div className="mx-auto max-w-2xl md:px-6">
          <div className="space-y-1 md:-mx-8">
            <h1 className="text-2xl font-bold">{chat.title}</h1>
            <div className="text-muted-foreground text-sm">
              {formatDate(chat.createdAt)} · {chat.messages.length} messages
            </div>
          </div>
        </div>
      </div>
      <ChatList messages={chat.messages} />
    </div>
    <FooterText className="py-8" />
  </>
);
```

---

## Components

### `components/header.tsx` — Top Navigation Bar

Sticky top bar (`h-16`) with frosted glass gradient background.

- **Left side**: sidebar hamburger (when logged in) or logo link (when logged out), separator icon, user menu or login link
- **Right side**: GitHub outline button + "Deploy to Vercel" filled button

```tsx
<header className="from-background/10 via-background/50 to-background/80 sticky top-0 z-50 flex h-16 w-full shrink-0 items-center justify-between border-b bg-gradient-to-b px-4 backdrop-blur-xl">
  <div className="flex items-center">
    {/* Sidebar trigger or logo */}
    <IconSeparator className="text-muted-foreground/50 h-6 w-6" />
    {/* UserMenu or Login link */}
  </div>
  <div className="flex items-center justify-end space-x-2">
    {/* GitHub button (outline) */}
    {/* Deploy to Vercel button (filled) */}
  </div>
</header>
```

### `components/sidebar.tsx` — Slide-out Sidebar

Sheet (drawer) with a 300px width, triggered by a ghost icon button.

```tsx
<Sheet>
  <SheetTrigger asChild>
    <Button variant="ghost" className="-ml-2 h-9 w-9 p-0">
      <IconSidebar className="h-6 w-6" />
    </Button>
  </SheetTrigger>
  <SheetContent className="inset-y-0 flex h-auto w-[300px] flex-col p-0">
    <SheetHeader className="p-4">
      <SheetTitle className="text-sm">Chat History</SheetTitle>
    </SheetHeader>
    {children}
  </SheetContent>
</Sheet>
```

### `components/sidebar-list.tsx` — Chat History List

```tsx
<div className="flex-1 overflow-auto">
  {chats?.length ? (
    <div className="space-y-2 px-2">
      {chats.map((chat) => (
        <SidebarItem key={chat.id} chat={chat}>
          <SidebarActions chat={chat} removeChat={removeChat} shareChat={shareChat} />
        </SidebarItem>
      ))}
    </div>
  ) : (
    <div className="p-8 text-center">
      <p className="text-muted-foreground text-sm">No chat history</p>
    </div>
  )}
</div>
```

### `components/sidebar-item.tsx` — Single Chat Row

Ghost button link with chat title. Shows message icon normally, users icon if shared. Active item gets `bg-accent`. Share/delete action buttons appear on hover when active.

```tsx
<div className="relative">
  <div className="absolute top-1 left-2 flex h-6 w-6 items-center justify-center">
    {chat.sharePath ? <IconUsers /> : <IconMessage />}
  </div>
  <Link
    href={chat.path}
    className={cn(
      buttonVariants({ variant: "ghost" }),
      "group w-full pr-16 pl-8",
      isActive && "bg-accent"
    )}
  >
    <div className="relative max-h-5 flex-1 overflow-hidden break-all text-ellipsis select-none">
      <span className="whitespace-nowrap">{chat.title}</span>
    </div>
  </Link>
  {isActive && <div className="absolute top-1 right-2">{children}</div>}
</div>
```

### `components/sidebar-actions.tsx` — Share & Delete Chat

Two ghost icon buttons (share + trash) that open dialogs:

- **Share dialog**: shows chat title/date/message count, a copy-link button, and (if already shared) a badge link to the share URL
- **Delete dialog**: confirmation AlertDialog with destructive action

### `components/sidebar-footer.tsx` — Sidebar Bottom Bar

```tsx
<div className="flex items-center justify-between p-4">
  <ThemeToggle />
  <ClearHistory clearChats={clearChats} />
</div>
```

### `components/chat.tsx` — Chat Orchestrator

Uses `useChat` from `ai/react`. Shows `<EmptyScreen>` when no messages, otherwise `<ChatList>` + scroll anchor. Always shows `<ChatPanel>` at bottom. Has a preview-mode dialog for entering an OpenAI API key.

```tsx
<div className={cn('pb-[200px] pt-4 md:pt-10', className)}>
  {messages.length ? <ChatList messages={messages} /> : <EmptyScreen setInput={setInput} />}
</div>
<ChatPanel ... />
```

### `components/empty-screen.tsx` — Welcome Card

Centered card (max-w-2xl) shown when no messages yet.

```tsx
<div className="mx-auto max-w-2xl px-4">
  <div className="bg-background rounded-lg border p-8">
    <h1 className="mb-2 text-lg font-semibold">Welcome to the Supabaseified Next.js AI Chatbot!</h1>
    <p className="text-muted-foreground mb-2 leading-normal">...</p>
    <p className="text-muted-foreground leading-normal">
      You can start a conversation here or try the following examples:
    </p>
    <div className="mt-4 flex flex-col items-start space-y-2">
      {exampleMessages.map((msg) => (
        <Button
          variant="link"
          className="h-auto p-0 text-base"
          onClick={() => setInput(msg.message)}
        >
          <IconArrowRight className="text-muted-foreground mr-2" />
          {msg.heading}
        </Button>
      ))}
    </div>
  </div>
</div>
```

Example prompts: "Explain technical concepts", "Summarize an article", "Draft an email"

### `components/chat-list.tsx` — Message Thread

```tsx
<div className="relative mx-auto max-w-2xl px-4">
  {messages.map((message, index) => (
    <div key={index}>
      <ChatMessage message={message} />
      {index < messages.length - 1 && <Separator className="my-4 md:my-8" />}
    </div>
  ))}
</div>
```

### `components/chat-message.tsx` — Single Message Row

Flex row with avatar on the left and markdown content on the right. User messages: white bg + user icon. AI messages: dark bg (`bg-primary text-primary-foreground`) + OpenAI icon.

```tsx
<div className={cn('group relative mb-4 flex items-start md:-ml-12')}>
  <div className={cn(
    'flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border shadow',
    message.role === 'user' ? 'bg-background' : 'bg-primary text-primary-foreground'
  )}>
    {message.role === 'user' ? <IconUser /> : <IconOpenAI />}
  </div>
  <div className="ml-4 flex-1 space-y-2 overflow-hidden px-1">
    <MemoizedReactMarkdown className="prose break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0" ...>
      {message.content}
    </MemoizedReactMarkdown>
    <ChatMessageActions message={message} />
  </div>
</div>
```

### `components/chat-panel.tsx` — Fixed Bottom Input Area

Fixed to `inset-x-0 bottom-0`. Gradient from transparent to muted. Contains:

- "Stop generating" or "Regenerate response" button (centered above the input)
- The `<PromptForm>` inside a card-like container
- `<FooterText>` below (hidden on mobile)

```tsx
<div className="fixed inset-x-0 bottom-0 bg-gradient-to-b from-muted/10 from-10% to-muted/30 to-50%">
  <ButtonScrollToBottom />
  <div className="mx-auto sm:max-w-2xl sm:px-4">
    <div className="flex h-10 items-center justify-center">
      {isLoading ? <Button>Stop generating</Button> : messages?.length > 0 && <Button>Regenerate response</Button>}
    </div>
    <div className="space-y-4 border-t bg-background px-4 py-2 shadow-lg sm:rounded-t-xl sm:border md:py-4">
      <PromptForm ... />
      <FooterText className="hidden sm:block" />
    </div>
  </div>
</div>
```

### `components/prompt-form.tsx` — Message Input

Auto-resizing textarea. Plus icon (new chat link) on left, send arrow button on right.

```tsx
<div className="bg-background relative flex max-h-60 w-full grow flex-col overflow-hidden px-8 sm:rounded-md sm:border sm:px-12">
  {/* New Chat button — absolute left */}
  <Link
    href="/"
    className={cn(
      buttonVariants({ size: "sm", variant: "outline" }),
      "absolute top-4 left-0 h-8 w-8 rounded-full ..."
    )}
  >
    <IconPlus />
  </Link>
  <Textarea
    rows={1}
    placeholder="Send a message."
    className="min-h-[60px] w-full resize-none bg-transparent px-4 py-[1.3rem] focus-within:outline-none sm:text-sm"
  />
  {/* Send button — absolute right */}
  <Button type="submit" size="icon" disabled={isLoading || input === ""}>
    <IconArrowElbow />
  </Button>
</div>
```

### `components/user-menu.tsx` — User Avatar Dropdown

Ghost button trigger: user avatar image (with ring) or initials fallback, plus display name. Dropdown shows: name + email (read-only), Vercel homepage link, Log Out.

```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" className="pl-0">
      {/* avatar image or initials div */}
      <span className="ml-2">{user?.user_metadata.name ?? "👋🏼"}</span>
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent sideOffset={8} align="start" className="w-[180px]">
    <DropdownMenuItem className="flex-col items-start">
      <div className="text-xs font-medium">{name}</div>
      <div className="text-xs text-zinc-500">{email}</div>
    </DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem>{/* Vercel Homepage link */}</DropdownMenuItem>
    <DropdownMenuItem onClick={signOut}>Log Out</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### `components/login-form.tsx` — Email/Password Form

Used for both sign-in and sign-up. Fieldset with Email + Password inputs, submit button, and a link to switch between modes.

```tsx
<form onSubmit={handleOnSubmit}>
  <fieldset className="flex flex-col gap-y-4">
    <div className="flex flex-col gap-y-1">
      <Label>Email</Label>
      <Input name="email" type="email" />
    </div>
    <div className="flex flex-col gap-y-1">
      <Label>Password</Label>
      <Input name="password" type="password" />
    </div>
  </fieldset>
  <div className="mt-4 flex items-center">
    <Button>{action === "sign-in" ? "Sign In" : "Sign Up"}</Button>
    <p className="ml-4">{/* link to the other auth mode */}</p>
  </div>
</form>
```

### `components/login-button.tsx` — GitHub OAuth Button

Outline button with GitHub icon. Only renders when `NEXT_PUBLIC_AUTH_GITHUB=true`.

### `components/clear-history.tsx` — Clear Chat History

Ghost "Clear history" button that opens an AlertDialog confirmation before deleting all chats.

### `components/theme-toggle.tsx` — Light/Dark Toggle

Ghost icon button; shows `<IconSun>` in light mode, `<IconMoon>` in dark mode.

### `components/footer.tsx` — Footer Text

```tsx
<p className="text-muted-foreground px-2 text-center text-xs leading-normal">
  Open source AI chatbot built with Next.js and Supabase.
</p>
```

---

## UI Primitives (shadcn/ui)

The following shadcn/ui components are used throughout. All follow standard shadcn conventions with Tailwind variants:

- `Button` — variants: default, outline, ghost, link; sizes: default, sm, icon
- `Input` — standard text input
- `Textarea` — standard textarea (also uses `react-textarea-autosize`)
- `Label` — form label
- `Dialog` / `DialogContent` / `DialogHeader` / `DialogTitle` / `DialogDescription` / `DialogFooter`
- `AlertDialog` — destructive confirmation pattern
- `Sheet` / `SheetContent` / `SheetHeader` / `SheetTitle` — slide-out drawer
- `DropdownMenu` / `DropdownMenuContent` / `DropdownMenuItem` / `DropdownMenuSeparator`
- `Tooltip` / `TooltipContent` / `TooltipTrigger`
- `Separator`
- `Badge` — variants: default, secondary
- `Select`
- `Switch`
- `CodeBlock` — syntax-highlighted code (used inside chat messages)

---

## Key UI Flows

1. **Unauthenticated**: Header shows logo + "Login" link. `/sign-in` and `/sign-up` pages center a form (max-w-sm) with email/password + optional GitHub OAuth button.

2. **Authenticated, new chat** (`/`): Header shows sidebar hamburger + user menu. Main area shows `<EmptyScreen>` with welcome card and 3 example prompt links. Fixed bottom bar shows the prompt textarea.

3. **Authenticated, active chat** (`/chat/[id]`): Messages render in a max-w-2xl centered column with avatars and markdown. Fixed bottom bar shows stop/regenerate controls above the input.

4. **Sidebar open**: 300px slide-out panel from the left. Lists past chats (scrollable), each with a title link. Active chat row shows share + delete icon buttons. Footer has theme toggle and "Clear history".

5. **Shared chat** (`/share/[id]`): Read-only view. Title + date header, then the message list. No input panel.
