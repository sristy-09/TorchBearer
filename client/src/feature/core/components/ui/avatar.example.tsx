/**
 * Avatar Component Usage Examples
 * 
 * This file demonstrates various ways to use the Avatar component.
 * Copy these examples into your components as needed.
 */

import { Avatar } from "./avatar";

// Example 1: Basic usage with Google profile picture
export function Example1() {
  const user = {
    name: "John Doe",
    avatar: "https://lh3.googleusercontent.com/a/example123",
  };

  return <Avatar name={user.name} avatarUrl={user.avatar} size="md" />;
}

// Example 2: User without profile picture (shows initials)
export function Example2() {
  const user = {
    name: "Jane Smith",
    avatar: "", // Empty or undefined
  };

  return <Avatar name={user.name} avatarUrl={user.avatar} size="md" />;
}

// Example 3: Different sizes
export function Example3() {
  const user = {
    name: "Alice Johnson",
    avatar: "https://example.com/avatar.jpg",
  };

  return (
    <div className="flex items-center gap-4">
      <Avatar name={user.name} avatarUrl={user.avatar} size="sm" />
      <Avatar name={user.name} avatarUrl={user.avatar} size="md" />
      <Avatar name={user.name} avatarUrl={user.avatar} size="lg" />
      <Avatar name={user.name} avatarUrl={user.avatar} size="xl" />
    </div>
  );
}

// Example 4: In a user list
export function Example4() {
  const users = [
    { id: 1, name: "John Doe", avatar: "https://example.com/john.jpg" },
    { id: 2, name: "Jane Smith", avatar: "" },
    { id: 3, name: "Bob Wilson", avatar: "https://example.com/bob.jpg" },
  ];

  return (
    <div className="space-y-3">
      {users.map((user) => (
        <div key={user.id} className="flex items-center gap-3">
          <Avatar name={user.name} avatarUrl={user.avatar} size="md" />
          <span className="font-medium">{user.name}</span>
        </div>
      ))}
    </div>
  );
}

// Example 5: In a comment section
export function Example5() {
  const comment = {
    author: {
      name: "Sarah Connor",
      avatar: "",
    },
    text: "This is a great post!",
    timestamp: "2 hours ago",
  };

  return (
    <div className="flex gap-3">
      <Avatar name={comment.author.name} avatarUrl={comment.author.avatar} size="sm" />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">{comment.author.name}</span>
          <span className="text-xs text-gray-500">{comment.timestamp}</span>
        </div>
        <p className="text-sm text-gray-700 mt-1">{comment.text}</p>
      </div>
    </div>
  );
}

// Example 6: In a card header
export function Example6() {
  const post = {
    author: {
      name: "Michael Scott",
      avatar: "https://example.com/michael.jpg",
      role: "alumni",
    },
    title: "Welcome to the community!",
  };

  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex items-center gap-3 mb-3">
        <Avatar name={post.author.name} avatarUrl={post.author.avatar} size="md" />
        <div>
          <p className="font-semibold">{post.author.name}</p>
          <p className="text-xs text-gray-500 capitalize">{post.author.role}</p>
        </div>
      </div>
      <h3 className="text-lg font-bold">{post.title}</h3>
    </div>
  );
}

// Example 7: With custom className
export function Example7() {
  const user = {
    name: "Emma Watson",
    avatar: "",
  };

  return (
    <Avatar
      name={user.name}
      avatarUrl={user.avatar}
      size="lg"
      className="ring-2 ring-blue-500 ring-offset-2"
    />
  );
}

// Example 8: In a navigation bar
export function Example8() {
  const currentUser = {
    name: "Tom Hardy",
    avatar: "https://example.com/tom.jpg",
  };

  return (
    <nav className="flex items-center justify-between p-4 bg-white border-b">
      <h1 className="text-xl font-bold">TorchBearer</h1>
      <button className="flex items-center gap-2 hover:bg-gray-100 rounded-lg p-2">
        <Avatar name={currentUser.name} avatarUrl={currentUser.avatar} size="sm" />
        <span className="text-sm font-medium">{currentUser.name}</span>
      </button>
    </nav>
  );
}

// Example 9: Stacked avatars (group)
export function Example9() {
  const members = [
    { name: "User One", avatar: "" },
    { name: "User Two", avatar: "" },
    { name: "User Three", avatar: "" },
  ];

  return (
    <div className="flex -space-x-2">
      {members.map((member, index) => (
        <div key={index} className="ring-2 ring-white">
          <Avatar name={member.name} avatarUrl={member.avatar} size="sm" />
        </div>
      ))}
    </div>
  );
}

// Example 10: With status indicator
export function Example10() {
  const user = {
    name: "Chris Evans",
    avatar: "https://example.com/chris.jpg",
    isOnline: true,
  };

  return (
    <div className="relative inline-block">
      <Avatar name={user.name} avatarUrl={user.avatar} size="md" />
      {user.isOnline && (
        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
      )}
    </div>
  );
}
